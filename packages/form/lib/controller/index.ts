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
  CommandItem,
  IServiceCommand,
  deepCopy,
  IServiceInitialize,
  IServiceControl
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
  public static fromForm<E, F extends FormItem<E>>(
    form: Form<E, F>
  ): Promise<FormController<E, F>> {
    return new Promise((resolve) => {
      const instance = new FormController<E, F>();

      instance.#form = form;
      instance.#initialEntity = {} as E;

      resolve(instance);
    });
  }

  /**
   * Static method to initialize the FormController with an entity.
   * @param entity The entity for the form
   */
  public static fromEntity<E, F extends FormItem<E>>(
    entity: E
  ): Promise<FormController<E, F>> {
    return new Promise(async (resolve) => {
      const instance = new FormController<E, F>();
      const initialReader: IReader<E, F> = createInitialReader();

      instance.#initialEntity = entity;
      instance.#form = {
        items: null,
        services: null,
        starters: null,
        readers: null
      };

      await initialReader.read(
        instance.#initialEntity,
        instance.#form,
        {} as any
      );

      resolve(instance);
    });
  }

  //#endregion

  /**
   * Trigger a form event.
   * @param eventType The type of the event
   * @param data Data associated with the event
   */
  private fireEvent(eventType: FormEvents, data: any): void {
    this.trigger(eventType, data);
  }

  /**
   * Create a command item for a form item.
   * @param item The form item
   * @returns A promise that resolves to a CommandItem
   */
  private async createCommandItem(item: F): Promise<CommandItem<E, F>> {
    let itemCustomCommand = {};
    for await (const service of this.#form?.services) {
      const { addCustomFeaturesForCommandItem } = service as IServiceCommand;

      if (addCustomFeaturesForCommandItem) {
        const command = addCustomFeaturesForCommandItem();
        itemCustomCommand = { ...itemCustomCommand, ...command };
      }
    }

    return {
      formItem: item,
      initialEntity: this.#initialEntity,
      getItem: this.getItem.bind(this),
      writeItems: this.writeItems.bind(this),
      ...itemCustomCommand
    };
  }

  /**
   * Create a command service for the form.
   * @returns A CommandService for the form
   */
  private createCommandService(): CommandService<E, F> {
    return {
      initialForm: this.#initialForm,
      initialEntity: this.#initialEntity,
      form: this.#form,
      itemsMap: this.#itemsMap,
      getItem: this.getItem.bind(this),
      writeItems: this.writeItems.bind(this),
      fireEvent: this.fireEvent.bind(this),
      createCommandItem: this.createCommandItem.bind(this)
    };
  }

  /**
   * Get a form item by its property key.
   * @param property The property key of the form item
   * @returns The form item corresponding to the property key
   */
  private getItem(property: keyof E) {
    const { items } = this.#form;
    const itemIndex = this.#itemsMap[property];

    if (!Number.isInteger(itemIndex)) {
      return null;
    }

    return items[itemIndex] as unknown as F;
  }

  /**
   * Write an array of form items to the form data.
   * @param items An array of form items
   */
  private async writeItems(items: Array<FormItem<E>>) {
    for await (const item of items) {
      const { items } = this.#form;
      const { property } = item;
      const index = this.#itemsMap[property];

      items[index] = item as F;
    }
  }

  /**
   * Get services by their names.
   * @param serviceName The name of the service
   * @param additionalServiceNames Additional names of services
   * @returns The requested services
   */
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceCommand,
    R = T & Array<T>
  >(serviceName: string, ...additionalServiceNames: string[]): R {
    if (
      Array.isArray(additionalServiceNames) &&
      additionalServiceNames.length > 0
    ) {
      const services = [
        this.#serviceMap[serviceName],
        ...additionalServiceNames.map((name) => this.#serviceMap[name])
      ];

      return services as R;
    }

    return this.#serviceMap[serviceName] as R;
  }

  /**
   * Registers form items by triggering the REGISTER_ITEMS event.
   */
  private registerFormItems(): void {
    this.fireEvent(
      'REGISTER_ITEMS',
      FormItemRegister.getInstance().getItemKeys()
    );
  }

  /**
   * Maps form items to their properties.
   */
  private mapFormItems(): void {
    let index = 0;
    this.#itemsMap = {} as Record<keyof E, number>;
    for (const item of this.#form.items) {
      this.#itemsMap[item.property] = index++;
    }
  }

  /**
   * Initializes the services defined in the form data.
   */
  private async initializeServices(): Promise<void> {
    if (this.#form.services) {
      for await (const service of this.#form.services) {
        const command = this.createCommandService();
        const serviceControl = service as IServiceInitialize<E, F>;

        this.#serviceMap[service.name] = service;

        if (serviceControl.initialize) {
          await serviceControl.initialize(command);
        }
      }
    }
  }

  /**
   * Executes the readers defined in the form data.
   */
  private async runReaders(): Promise<void> {
    if (this.#form.readers) {
      for await (const reader of this.#form.readers) {
        reader.read(this.#initialEntity, this.#form, this.#itemsMap);
      }
    }
  }

  /**
   * Executes the starters defined in the form data.
   */
  private async runStarters(): Promise<void> {
    if (this.#form.starters) {
      for await (const starter of this.#form.starters) {
        this.#form = await starter.run(this.#form, this.#initialEntity);
      }
    }
  }

  /**
   * Creates a deep copy of the form data for the initial state.
   */
  private deepCopyForm(): void {
    this.#initialForm = deepCopy(this.#form);
  }

  /**
   * Starts the form controller by executing all necessary steps to initialize the form.
   * @returns A promise that resolves when the form is fully initialized.
   */
  public async start(): Promise<Form<E, F>> {
    try {
      this.registerFormItems();
      this.mapFormItems();

      await this.initializeServices();
      await this.runReaders();
      await this.runStarters();

      this.mapFormItems();
      this.deepCopyForm();

      // Trigger an update event after the form is fully initialized
      return this.#form;
    } catch (error) {
      console.error('Error starting the form controller:', error);
      throw error;
    }
  }
}
