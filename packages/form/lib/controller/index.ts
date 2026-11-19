import { BaseListener } from '@punica/common';
import {
  Form,
  FormEvents,
  FormItemRegister,
  FormItem,
  IReader,
  IService,
  createInitialReader,
  CommandService,
  IServiceCommand,
  deepCopy,
  IServiceInitialize,
  IServiceControl,
  getDevToolsBridge
} from '..';

/**
 * Controller for managing a form and its associated services.
 */
export class FormController<
  E,
  F extends FormItem<E>
> extends BaseListener<FormEvents> {
  #serviceMap: Record<string, IService>; // Map to store services by their names
  #itemsMap: Record<keyof E, number>; // Map to store form items by their properties
  #form: Form<E, F>; // Current form data
  #initialForm: Form<E, F>; // Initial deep copy of the form data
  #initialEntity: E; // Initial entity for the form

  //#region constructor

  /**
   * Private constructor to prevent direct instantiation.
   */
  private constructor() {
    super();

    this.#serviceMap = {};
    this.#itemsMap = {} as Record<keyof E, number>;
  }

  /**
   * Static method to initialize the FormController with form data.
   * @param form The initial form data
   */
  public static async fromForm<E, F extends FormItem<E>>(
    form: Form<E, F>
  ): Promise<FormController<E, F>> {
    const instance = new FormController<E, F>();

    instance.#form = form;
    instance.#initialEntity = {} as E;

    return instance;
  }

  /**
   * Static method to initialize the FormController with an entity.
   * @param entity The entity for the form
   */
  public static async fromEntity<E, F extends FormItem<E>>(
    entity: E
  ): Promise<FormController<E, F>> {
    const instance = new FormController<E, F>();
    const initialReader: IReader<E, F> = createInitialReader();

    instance.#initialEntity = entity;
    instance.#form = {
      items: null,
      services: null,
      starters: null,
      readers: null
    };

    await initialReader.read(instance.#initialEntity, instance.#form);

    return instance;
  }

  //#endregion

  /**
   * Trigger a form event.
   * @param eventType The type of the event
   * @param data Data associated with the event
   */
  private fireEvent = (eventType: FormEvents, data: any): void => {
    this.trigger(eventType, data);

    const devTools = getDevToolsBridge();
    const isEnabled = devTools.isEnabled();

    if (isEnabled) {
      switch (eventType) {
        case 'UPDATE_FORM':
          devTools.sendUpdate(this.#form);
          // Also send entity update
          this.sendEntityToDevTools();
          break;
        case 'RESET':
          devTools.sendReset(this.#form);
          break;
        case 'UPDATE_ITEM':
          devTools.sendUpdateItem(data);
          break;
        case 'REGISTER_ITEMS':
          devTools.sendRegisterItems(data);
          break;
      }
    }
  };

  /**
   * Send entity data to DevTools
   */
  private sendEntityToDevTools = (): void => {
    const devTools = getDevToolsBridge();
    if (!devTools.isEnabled()) {
      return;
    }

    const getValues = this.getServices<IServiceControl<E>>('getValues');

    // Debugging must never break the form
    getValues
      ?.run()
      .then((entity) => devTools.sendEntity(entity))
      .catch(() => {});
  };

  /**
   * Create a command service for the form.
   * @returns A CommandService for the form
   */
  private createCommandService = (): CommandService<E, F> => {
    const getItem: CommandService<E, F>['getItem'] = (property) => {
      const index = this.#itemsMap[property];

      return Number.isInteger(index) ? this.#form.items[index] : null;
    };

    const writeItems: CommandService<E, F>['writeItems'] = async (items) => {
      for (const item of items) {
        const index = this.#itemsMap[item.property];

        if (Number.isInteger(index)) {
          this.#form.items[index] = item as F;
        }
      }
    };

    const createCommandItem: CommandService<E, F>['createCommandItem'] = async (
      item
    ) => {
      let itemCustomCommand = {};

      for (const service of this.#form.services ?? []) {
        // Called on the service so that its own state stays reachable
        const command = (
          service as IServiceCommand
        ).addCustomFeaturesForCommandItem?.();

        itemCustomCommand = { ...itemCustomCommand, ...command };
      }

      return {
        formItem: item,
        initialEntity: this.#initialEntity,
        getItem,
        writeItems,
        ...itemCustomCommand
      };
    };

    const command = {
      initialEntity: this.#initialEntity,
      getItem,
      writeItems,
      fireEvent: this.fireEvent,
      createCommandItem
    } as CommandService<E, F>;

    // Getters keep services in sync with the current state of the controller
    return Object.defineProperties(command, {
      form: { enumerable: true, get: () => this.#form },
      initialForm: { enumerable: true, get: () => this.#initialForm },
      itemsMap: { enumerable: true, get: () => this.#itemsMap }
    });
  };

  /**
   * Registers form items by triggering the REGISTER_ITEMS event.
   */
  private registerFormItems = (): void => {
    this.fireEvent(
      'REGISTER_ITEMS',
      Array.from(FormItemRegister.getInstance().getItemKeys())
    );
  };

  /**
   * Maps form items to their properties.
   */
  private mapFormItems = (): void => {
    let index = 0;
    this.#itemsMap = {} as Record<keyof E, number>;
    for (const item of this.#form.items) {
      this.#itemsMap[item.property] = index++;
    }
  };

  /**
   * Initializes the services defined in the form data.
   */
  private initializeServices = async (): Promise<void> => {
    for (const service of this.#form.services ?? []) {
      const command = this.createCommandService();
      const serviceControl = service as IServiceInitialize<E, F>;

      this.#serviceMap[service.name] = service;

      if (serviceControl.initialize) {
        await serviceControl.initialize(command);
      }
    }
  };

  /**
   * Executes the readers defined in the form data.
   */
  private runReaders = async (): Promise<void> => {
    for (const reader of this.#form.readers ?? []) {
      await reader.read(this.#initialEntity, this.#form, this.#itemsMap);
    }
  };

  /**
   * Executes the starters defined in the form data.
   */
  private runStarters = async (): Promise<void> => {
    for (const starter of this.#form.starters ?? []) {
      this.#form = await starter.run(this.#form, this.#initialEntity);
    }
  };

  /**
   * Keeps a deep copy of the form items for the initial state.
   * Services, readers and starters are shared, not copied.
   */
  private deepCopyForm = (): void => {
    this.#initialForm = { ...this.#form, items: deepCopy(this.#form.items) };
  };

  /**
   * Get services by their names.
   * Overloads to return a single item or an array based on provided names.
   */
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceCommand
  >(serviceName: string): T;
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceCommand
  >(serviceName: string, ...additionalServiceNames: string[]): T[];
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceCommand
  >(serviceName: string, ...additionalServiceNames: string[]): T | T[] {
    if (additionalServiceNames.length > 0) {
      const list = [
        this.#serviceMap[serviceName],
        ...additionalServiceNames.map((name) => this.#serviceMap[name])
      ];
      return list as T[];
    }
    return this.#serviceMap[serviceName] as T;
  }

  /**
   * Starts the form controller by executing all necessary steps to initialize the form.
   * @returns A promise that resolves when the form is fully initialized.
   */
  public async start(): Promise<Form<E, F>> {
    this.registerFormItems();
    this.mapFormItems();

    await this.runReaders();
    await this.runStarters();

    // Services are initialized against the final form produced by starters
    this.mapFormItems();
    await this.initializeServices();
    this.deepCopyForm();

    const devTools = getDevToolsBridge();

    if (devTools.isEnabled()) {
      devTools.sendInit(this.#form);
      this.sendEntityToDevTools();
    }

    return this.#form;
  }
}
