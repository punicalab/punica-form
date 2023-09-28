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
 *
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

  public constructor(formData: Form<E, F>);
  public constructor(entity: E, reader: IReader<E, F>);
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
    this.createCommandItem = this.createCommandItem.bind(this);
    this.fireEvent = this.fireEvent.bind(this);
  }

  //#endregion

  /**
   *
   * @param eventType
   * @param data
   */
  fireEvent(eventType: FormEvents, data: any): void {
    this.trigger(eventType, data);
  }

  /**
   *
   * @param item
   * @returns
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
      getItem: this.getItem,
      writeItems: this.writeItems,
      ...itemCustomCommand
    };
  }

  /**
   *
   * @returns
   */
  private createCommandService(): CommandService<E, F> {
    return {
      initialFormData: this.#initialFormData,
      initialEntity: this.#initialEntity,
      formData: this.#formData,
      itemsMap: this.#itemsMap,
      fireEvent: this.fireEvent,
      getItem: this.getItem,
      writeItems: this.writeItems,
      createCommandItem: this.createCommandItem
    };
  }

  /**
   *
   * @param property
   * @returns
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
   *
   * @param items
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
   *
   * @param name
   * @param names
   * @returns
   */
  public getServices<
    T = IServiceInitialize<E, F> & IServiceControl & IServiceAddCommand,
    R = T & Array<T>
  >(name: string, ...names: Array<string>): R {
    if (Array.isArray(names) && names.length > 1) {
      const services = [this.#serviceMap[name]];

      names.forEach((name) => {
        services.push(this.#serviceMap[name]);
      });

      return services as R;
    }

    return this.#serviceMap[name] as R;
  }

  /**
   *
   * @param reader
   */
  public start(): Promise<Form<E, F>> {
    return new Promise(async (resolve) => {
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

      //create item map
      let index = 0;
      this.#itemsMap = {} as Record<keyof E, number>;
      for await (const item of this.#formData.items) {
        this.#itemsMap[item.property] = index++;
      }

      //form data deep clone
      this.#initialFormData = deepCopy(this.#formData);

      //initialize service
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

      resolve(this.#formData);
    });
  }
}
