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
  CommandItem
} from '..';

/**
 *
 */
export class FormController<
  E,
  F extends FormItem<E>
> extends BaseListener<FormEvents> {
  #serviceMap: Record<string, IService<E, F>>;
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
  }

  //#endregion

  /**
   *
   * @param eventType
   * @param data
   */
  private fireEvent(eventType: FormEvents, data: any): void {
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
      const { getItemCommand } = service;

      if (getItemCommand) {
        const command = getItemCommand();

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
      formData: this.#formData,
      initialEntity: this.#initialEntity,
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
   * @returns
   */
  public getService(serviceName: string): IService<E, F> {
    return this.#serviceMap[serviceName];
  }

  /**
   *
   * @returns
   */
  public getEntity(): Promise<E> {
    return new Promise(async (resolve) => {
      const { items } = this.#formData;
      const entity = { ...this.#initialEntity };

      for await (const item of items) {
        const { property, value } = item;

        entity[property] = value;
      }

      resolve(entity);
    });
  }

  /**
   *
   * @param reader
   */
  public start(): Promise<Form<E, F>> {
    return new Promise(async (resolve) => {
      this.fireEvent(
        FormEvents.REGISTER_ITEMS,
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
        this.#initialEntity = await this.getEntity();
      }

      //create item map
      let index = 0;
      this.#itemsMap = {} as Record<keyof E, number>;
      for await (const item of this.#formData.items) {
        this.#itemsMap[item.property] = index++;
      }

      //form data deep clone
      this.#initialFormData = Object.assign({}, this.#formData);

      //initialize service
      if (this.#formData.services) {
        for await (const service of this.#formData?.services) {
          const command = this.createCommandService();

          this.#serviceMap[service.name] = service;

          service.initialize(command);
        }
      }

      resolve(this.#formData);
    });
  }
}
