import {
  CommandItem,
  CommandService,
  Form,
  FormEventMap,
  FormItem,
  FormItemRegister,
  IService,
  IServiceCommand,
  IServiceControl,
  IServiceInitialize,
  ServiceRegistry,
  createInitialReader,
  deepCopy,
  defaultFormItemRegister
} from '..';
import { sendToDevTools } from '../utils/devtools';

export type FormControllerOptions = {
  /** Identifies the form in developer tools. Defaults to the name of its class. */
  name?: string;

  /** The register whose form item types the form reports. */
  register?: FormItemRegister;
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

let formCount = 0;

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
  // eslint-disable-next-line @typescript-eslint/ban-types
  #services = new Map<Function, IService>();
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

    return new FormController<E, F>(form, entity, options);
  }

  /**
   * The current form. It is never changed: after a change this returns a
   * new object.
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
   * The service of a class listed in `@Services`.
   * @throws When the form has no service of the class
   */
  public getService<S extends IService>(
    service: ServiceClass<S>
  ): BoundService<S, E, F> {
    const instance = this.#services.get(service);

    if (!instance) {
      throw new Error(
        `Service not found: ${service.name}. Add it to @Services.`
      );
    }

    return instance as BoundService<S, E, F>;
  }

  /**
   * Starts the form: runs its readers and starters and initializes its
   * services.
   * @returns The form
   */
  public async start(): Promise<Form<E, F>> {
    this.#emit('REGISTER_ITEMS', this.#register.getItemKeys());

    for (const reader of this.#form.readers ?? []) {
      await reader.read(this.#initialEntity, this.#form);
    }

    for (const starter of this.#form.starters ?? []) {
      this.#form = await starter.run(this.#form, this.#initialEntity);
    }

    this.#mapItems();

    const command = this.#createCommandService();

    for (const service of this.#form.services ?? []) {
      this.#services.set(service.constructor, service);

      await (service as Partial<IServiceInitialize<E, F>>).initialize?.(
        command
      );
    }

    this.#initialItems = deepCopy(this.#form.items);

    sendToDevTools(this.#name, '@@INIT', this.#form);
    this.#sendEntityToDevTools();

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
        next[index] = item as F;
        changed = true;
      }
    }

    if (!changed) {
      return;
    }

    this.#form = { ...this.#form, items: next };
    this.#subscribers.forEach((listener) => listener());
    this.#emit('UPDATE_FORM', this.#form);
    this.#sendEntityToDevTools();
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
    const features = (this.#form.services ?? []).reduce(
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
    emit: this.#emit,
    createCommandItem: this.#createCommandItem
  });

  /** Developer tools show the entity as the `getValues` service returns it. */
  #sendEntityToDevTools(): void {
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
