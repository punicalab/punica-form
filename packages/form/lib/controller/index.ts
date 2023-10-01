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
  IServiceAddCommand,
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
  #serviceMap: Record<string, IService>;
  #itemsMap: Record<keyof E, number>;
  #formData: Form<E, F>;
  #reader: IReader<E, F>;
  #initialFormData: Form<E, F>;
  #initialEntity: E;

  //#region constructor

  /**
   * Constructor for initializing the FormController with form data.
   * @param formData - The initial form data
   */
  public constructor(formData: Form<E, F>);

  /**
   * Constructor for initializing the FormController with an entity and reader.
   * @param entity - The entity for the form
   * @param reader - The reader for initializing the form
   */
  public constructor(entity: E, reader: IReader<E, F>);

  /**
   *
   * @param args
   */
  public constructor(...args: any[]) {
    super();

    if (args.length == 1) {
      const [formData] = args;

      this.#formData = formData;
    } else if (args.length == 2) {
      const [entity, reader] = args;

      this.#initialEntity = entity;
      this.#reader = reader;
    }

    this.#serviceMap = {};
    this.#itemsMap = {} as Record<keyof E, number>;
  }

  //#endregion

  /**
   * Trigger a form event.
   * @param eventType - The type of the event
   * @param data - Data associated with the event
   */
  private fireEvent(eventType: FormEvents, data: any): void {
    this.trigger(eventType, data);
  }

  /**
   * Create a command item for a form item.
   * @param item - The form item
   * @returns A promise that resolves to a CommandItem
   */
  private async createCommandItem(item: F): Promise<CommandItem<E, F>> {
    let itemCustomCommand = {};
    for await (const service of this.#formData?.services) {
      const { addCustomFeaturesForCommandItem } = service as IServiceAddCommand;

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
      initialFormData: this.#initialFormData,
      initialEntity: this.#initialEntity,
      formData: this.#formData,
      itemsMap: this.#itemsMap,
      getItem: this.getItem.bind(this),
      writeItems: this.writeItems.bind(this),
      fireEvent: this.fireEvent.bind(this),
      createCommandItem: this.createCommandItem.bind(this)
    };
  }

  /**
   * Get a form item by its property key.
   * @param property - The property key of the form item
   * @returns The form item corresponding to the property key
   */
  private getItem(property: keyof E) {
    const { items, itemsMap } = this.#formData;
    const itemIndex = itemsMap[property];

    if (!Number.isInteger(itemIndex)) {
      return null;
    }

    return items[itemIndex] as unknown as F;
  }

  /**
   * Write an array of form items to the form data.
   * @param items - An array of form items
   */
  private async writeItems(items: Array<FormItem<E>>) {
    for await (const item of items) {
      const { itemsMap, items } = this.#formData;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  }

  /**
   * Get services by name(s).
   * @param serviceName - The name of the service
   * @param additionalServiceNames - Additional names of services
   * @returns The requested services
   */
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceAddCommand,
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
   * Start the form controller.
   * @returns A promise that resolves to the form data
   */
  public start(): Promise<Form<E, F>> {
    return new Promise(async (resolve) => {
      // Trigger the REGISTER_ITEMS event with the registered item keys
      this.fireEvent(
        'REGISTER_ITEMS',
        FormItemRegister.getInstance().getItemKeys()
      );

      if (this.#formData == null) {
        const initialReader: IReader<E, F> = createInitialReader();

        this.#formData = await initialReader.read(this.#initialEntity);

        if (this.#reader) {
          this.#formData = await this.#reader.read(
            this.#initialEntity,
            this.#formData
          );
        }
      } else {
        this.#initialEntity = {} as E;
      }

      // Create item map
      let index = 0;
      this.#itemsMap = {} as Record<keyof E, number>;
      for await (const item of this.#formData.items) {
        this.#itemsMap[item.property] = index++;
      }

      // Initialize services
      // The services you want to use are started
      if (this.#formData.services) {
        for await (const service of this.#formData?.services) {
          const command = this.createCommandService();
          const serviceControl = service as IServiceInitialize<E, F>;

          this.#serviceMap[service.name] = service;

          if (serviceControl.initialize) {
            serviceControl.initialize(command);
          }
        }
      }

      // Executed starter methods
      if (this.#formData.starters) {
        for await (const starter of this.#formData.starters) {
          // Execute starter run methods
          this.#formData = await starter.run(
            this.#formData,
            this.#initialEntity
          );
        }
      }

      // Deep clone form data
      this.#initialFormData = deepCopy(this.#formData);

      resolve(this.#formData);
    });
  }
}
