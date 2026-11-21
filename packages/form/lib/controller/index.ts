import {
  CommandItem,
  CommandService,
  Form,
  FormEventMap,
  FormItem,
  FormItemRegister,
  FormState,
  FormStatePatch,
  IService,
  IServiceCommand,
  IServiceControl,
  IServiceInitialize,
  ServiceRegistry,
  createInitialReader,
  deepCopy,
  defaultFormItemRegister,
  isEqual
} from '..';
import { shared } from '../shared';
import { isDevToolsEnabled, sendToDevTools } from '../utils/devtools';

export type FormControllerOptions = {
  /** Identifies the form in developer tools. Defaults to the name of its class. */
  name?: string;

  /** The register whose form item types the form reports. */
  register?: FormItemRegister;

  /**
   * The services of a form whose class lists none with `@Services`. The
   * rows of a list get the services of the form they belong to this way.
   */
  services?: Array<IService | (new () => IService)>;
};

/** A class whose instances are services. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ServiceClass<S extends IService> = new (...args: any[]) => S;

/** The keys of `ServiceRegistry` a service class is registered under. */
type RegistryKey<S> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof ServiceRegistry<any, any>]: ServiceRegistry<any, any>[K] extends S
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      S extends ServiceRegistry<any, any>[K]
      ? K
      : never
    : never;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}[keyof ServiceRegistry<any, any>];

/**
 * A service bound to the entity and the item type of a form, when its class
 * is in `ServiceRegistry`; the service as it is otherwise.
 */
type BoundService<S, E, F extends FormItem<E>> = [RegistryKey<S>] extends [
  never
]
  ? S
  : ServiceRegistry<E, F>[RegistryKey<S>];

const DOCS_URL = 'https://form.punicalab.com';

let formCount = 0;

const INITIAL_STATE: FormState = {
  dirty: false,
  touched: false,
  valid: true,
  validating: false,
  submitting: false,
  submitCount: 0,
  errors: []
};

/**
 * Holds the state of a form and runs its readers, starters and services.
 * The form is immutable: every change produces a new form object.
 */
export class FormController<
  E extends object,
  F extends FormItem<E> = FormItem<E>
> {
  #form: Form<E, F>;
  #initialItems: F[] = [];
  #itemsMap = new Map<keyof E, number>();
  /** The services of the form, by their class. */
  #services = new Map<object, IService>();
  #started = false;
  #batching = 0;
  #pending = false;
  #epoch = 0;
  #writes = new Map<keyof E, number>();
  #subscribers = new Set<() => void>();
  #listeners = new Map<string, Set<(payload: never) => void>>();
  readonly #initialEntity: E;
  readonly #register: FormItemRegister;
  readonly #name: string;

  private constructor(
    form: Form<E, F>,
    entity: E,
    options: FormControllerOptions
  ) {
    this.#form = form;
    this.#initialEntity = entity;
    this.#register = options.register ?? defaultFormItemRegister;
    this.#name = `${options.name ?? entity.constructor.name}#${++formCount}`;
  }

  /**
   * Creates a controller for a form that is described as data.
   */
  public static async fromForm<
    E extends object,
    F extends FormItem<E> = FormItem<E>
  >(
    form: Form<E, F>,
    options: FormControllerOptions = {}
  ): Promise<FormController<E, F>> {
    return new FormController<E, F>(form, {} as E, {
      name: 'Form',
      ...options
    });
  }

  /**
   * Creates a controller for an instance of a decorated form class.
   */
  public static async fromEntity<
    E extends object,
    F extends FormItem<E> = FormItem<E>
  >(
    entity: E,
    options: FormControllerOptions = {}
  ): Promise<FormController<E, F>> {
    const form: Form<E, F> = { items: [] };

    await createInitialReader<E, F>().read(entity, form);

    if (!form.services?.length && options.services) {
      form.services = options.services;
    }

    // Readers and starters may still add items when the form is started
    if (!form.items.length && !form.readers?.length && !form.starters?.length) {
      console.warn(
        `[punica-form] ${options.name ?? entity.constructor?.name ?? 'The form'} has no form items. Its properties need a form item decorator. If they have one, the build of the project does not apply decorators: see ${DOCS_URL}/docs/installation, or define the form with defineForm, which needs no decorator syntax.`
      );
    }

    return new FormController<E, F>(form, entity, options);
  }

  /**
   * The current form. A form object is never changed once it is returned:
   * after `start()` and after every change this returns a new object.
   */
  public getForm = (): Form<E, F> => {
    return this.#form;
  };

  /**
   * Calls the listener after every change of the form.
   * @returns A function that removes the listener
   */
  public subscribe = (listener: () => void): (() => void) => {
    this.#subscribers.add(listener);

    return () => this.#subscribers.delete(listener);
  };

  /**
   * Listens to an event of the form.
   * @returns A function that removes the handler
   */
  public on<K extends keyof FormEventMap<E, F>>(
    event: K,
    handler: (payload: FormEventMap<E, F>[K]) => void
  ): () => void {
    const handlers = this.#listeners.get(event) ?? new Set();

    this.#listeners.set(event, handlers.add(handler));

    return () => handlers.delete(handler);
  }

  /**
   * The service of a class listed in `@Services`, or of a subclass of it.
   * @throws When the form is not started yet or has no service of the class
   */
  public getService<S extends IService>(
    service: ServiceClass<S>
  ): BoundService<S, E, F> {
    if (!this.#started) {
      throw new Error(
        `Services are available after start(): ${service.name} was read too early.`
      );
    }

    const instance =
      this.#services.get(service) ??
      [...this.#services.values()].find((other) => other instanceof service);

    if (!instance) {
      throw new Error(
        `Service not found: ${service.name}. Add it to @Services.`
      );
    }

    return instance as BoundService<S, E, F>;
  }

  /**
   * Runs changes as one: subscribers and UPDATE_FORM listeners are notified
   * once, after the function returned or the promise it returned settled.
   */
  public batch = <T>(change: () => T): T => {
    const done = (): void => {
      if (--this.#batching === 0 && this.#pending) {
        this.#pending = false;
        this.#notify();
      }
    };

    this.#batching++;

    let result: T;

    try {
      result = change();
    } catch (error) {
      done();
      throw error;
    }

    // Outside the try: a subscriber that throws must not end the batch twice
    if (result instanceof Promise) {
      return result.finally(done) as T;
    }

    done();

    return result;
  };

  /**
   * Starts the form: runs its readers and starters and initializes its
   * services.
   * @returns The form
   */
  public async start(): Promise<Form<E, F>> {
    this.#emit('REGISTER_ITEMS', this.#register.getItemKeys());

    // Readers and starters work on a draft: the form getForm() returned
    // before start() is left as it was
    let form: Form<E, F> = { ...this.#form, items: [...this.#form.items] };

    for (const reader of form.readers ?? []) {
      await reader.read(this.#initialEntity, form);
    }

    for (const starter of form.starters ?? []) {
      form = await starter.run(form, this.#initialEntity);
    }

    this.#form = form;
    this.#mapItems();

    const command = this.#createCommandService();

    for (const entry of form.services ?? []) {
      // A class gives every form its own service; an instance is shared by
      // the forms it is given to and only serves the last one started
      const service =
        typeof entry === 'function'
          ? new (entry as new () => IService)()
          : entry;

      if (typeof entry !== 'function') {
        if (shared.usedServices.has(service)) {
          console.warn(
            `[punica-form] The same ${service.constructor.name} instance is used by more than one form. Pass the class to @Services instead.`
          );
        }

        shared.usedServices.add(service);
      }

      this.#services.set(service.constructor, service);

      await (service as Partial<IServiceInitialize<E, F>>).initialize?.(
        command
      );
    }

    if (
      this.#form.items.some((item) => item.row) &&
      ![...this.#services.values()].some(({ name }) => name === 'fieldArray')
    ) {
      console.warn(
        `[punica-form] ${this.#name} has a list of rows but no FieldArray service: add FieldArray of @punica/form-service to @Services.`
      );
    }

    this.#initialItems = deepCopy(this.#form.items);
    this.#form = {
      ...this.#form,
      state: this.#deriveState(this.#form.items)
    };
    this.#started = true;

    sendToDevTools(this.#name, '@@INIT', this.#form);
    this.#notify();

    return this.#form;
  }

  #mapItems(): void {
    this.#itemsMap = new Map(
      this.#form.items.map((item, index) => [item.property, index])
    );
  }

  #getItem = (property: keyof E): F | undefined => {
    const index = this.#itemsMap.get(property);

    return index === undefined ? undefined : this.#form.items[index];
  };

  /** The only place the form changes after it was started. */
  #setItems = (items: Array<FormItem<E>>): void => {
    const next = [...this.#form.items];
    let changed = false;

    for (const item of items) {
      const index = this.#itemsMap.get(item.property);

      if (index !== undefined) {
        const initial = this.#initialItems[index];
        const dirty = Boolean(initial) && !isEqual(item.value, initial.value);

        next[index] = (
          dirty === Boolean(item.dirty) ? item : { ...item, dirty }
        ) as F;
        changed = true;
      }
    }

    if (changed) {
      this.#commit({
        ...this.#form,
        items: next,
        state: this.#deriveState(next)
      });
    }
  };

  #setState = (patch: FormStatePatch): void => {
    const state = this.#deriveState(this.#form.items, patch);

    if (state !== this.#form.state) {
      this.#commit({ ...this.#form, state });
    }
  };

  /**
   * The state of the form for its items. The current state object is
   * returned when nothing changed, so it can be compared by reference.
   */
  #deriveState(items: F[], patch: FormStatePatch = {}): FormState {
    // A form may have used the name for data of its own before 2.2
    const known = Array.isArray(this.#form.state?.errors);
    const current = known ? (this.#form.state as FormState) : INITIAL_STATE;
    const next: FormState = {
      ...current,
      ...patch,
      dirty: items.some((item) => item.dirty),
      touched: items.some((item) => item.touched),
      validating: items.some((item) => item.validating),
      // Like the validation, which skips items the user cannot change
      valid: items.every((item) => !item.error || item.hidden || item.disabled)
    };
    const same = (Object.keys(next) as Array<keyof FormState>).every((key) =>
      isEqual(next[key], current[key])
    );

    return same && known ? current : next;
  }

  #commit(form: Form<E, F>): void {
    this.#form = form;

    if (this.#batching) {
      this.#pending = true;
    } else {
      this.#notify();
    }
  }

  /** Tells everyone who follows the form that it changed. */
  #notify(): void {
    this.#subscribers.forEach((listener) => listener());
    this.#emit('UPDATE_FORM', this.#form);
    this.#sendEntityToDevTools();
  }

  #supersede = (property?: keyof E): (() => boolean) => {
    if (property === undefined) {
      this.#epoch++;
    } else {
      this.#writes.set(property, (this.#writes.get(property) ?? 0) + 1);
    }

    const epoch = this.#epoch;
    const write = property === undefined ? 0 : this.#writes.get(property);

    return () =>
      epoch === this.#epoch &&
      (property === undefined || write === this.#writes.get(property));
  };

  #emit = <K extends keyof FormEventMap<E, F>>(
    event: K,
    payload: FormEventMap<E, F>[K]
  ): void => {
    this.#listeners
      .get(event)
      ?.forEach((handler) => (handler as (payload: unknown) => void)(payload));

    if (event === 'UPDATE_ITEM') {
      for (const item of payload as F[]) {
        sendToDevTools(this.#name, event, item, String(item.property));
      }
    } else {
      sendToDevTools(this.#name, event, payload);
    }
  };

  #createCommandItem = (item: F): CommandItem<E, F> => {
    // Features are added by calling the services, so their own state stays reachable
    const features = [...this.#services.values()].reduce(
      (all, service) => ({
        ...all,
        ...(
          service as Partial<IServiceCommand>
        ).addCustomFeaturesForCommandItem?.()
      }),
      {}
    );

    // Item functions get copies: the state cannot be changed from outside
    return {
      ...features,
      formItem: { ...item },
      initialEntity: this.#initialEntity,
      getItem: (property) => {
        const found = this.#getItem(property);

        return found && { ...found };
      }
    };
  };

  #createCommandService = (): CommandService<E, F> => ({
    initialEntity: this.#initialEntity,
    getForm: this.getForm,
    getInitialItems: () => this.#initialItems,
    getItem: this.#getItem,
    setItems: this.#setItems,
    setState: this.#setState,
    supersede: this.#supersede,
    emit: this.#emit,
    createCommandItem: this.#createCommandItem
  });

  /** Developer tools show the entity as the `getValues` service returns it. */
  #sendEntityToDevTools(): void {
    if (!isDevToolsEnabled()) {
      return;
    }

    const getValues = [...this.#services.values()].find(
      (service) => service.name === 'getValues'
    ) as IServiceControl | undefined;

    // Debugging must never break the form
    getValues
      ?.run()
      .then((entity) => sendToDevTools(this.#name, 'ENTITY', entity))
      .catch(() => undefined);
  }
}
