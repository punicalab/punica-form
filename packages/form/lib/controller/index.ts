import { BaseListener, IEntity } from '@punica/common';
import {
  CommandItem,
  Form,
  FormEvents,
  FormItemRegister,
  FormItem,
  IReader,
  IService,
  createInitialReader,
  CommandService
} from '..';

/**
 *
 */
export class FormController<
  E extends IEntity,
  F extends FormItem<E>
> extends BaseListener<FormEvents> {
  private _formData: Form<E, F>;
  private _initialFormData: Form<E, F>;
  private _reader: IReader<E, F>;
  private _entity: E;

  //#region constructor

  public constructor(formData: Form<E, F>);
  public constructor(entity: E, reader: IReader<E, F>);
  public constructor(...args: any[]) {
    super();

    if (args.length == 1) {
      const [formData] = args;

      this._formData = formData;
    } else if (args.length == 2) {
      const [entity, reader] = args;

      this._entity = entity;
      this._reader = reader;
    }
  }

  //#endregion

  /**
   *
   * @param eventType
   * @param data
   */
  protected fireEvent(eventType: FormEvents, data: any): void {
    this.trigger(eventType, data);
  }

  /**
   *
   * @param item
   * @returns
   */
  protected getCommandItem(item: F): CommandItem<E, F> {
    return {
      formItem: item,
      entity: this._entity,
      getItem: this.getItem
    };
  }

  /**
   *
   * @returns
   */
  protected getCommandService(): CommandService<E, F> {
    return {
      initialFormData: this._initialFormData,
      formData: this._formData,
      entity: this._entity,
      fireEvent: this.fireEvent
    };
  }

  /**
   *
   * @param property
   * @returns
   */
  public getItem(property: keyof E) {
    const { items, itemsMap } = this._formData;
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
  public async writeItems(items: Array<FormItem<E>>) {
    for await (const item of items) {
      const { itemsMap, items } = this._formData;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  }

  /**
   *
   * @returns
   */
  public getInitialEntity(): E {
    return this._entity;
  }

  /**
   *
   * @returns
   */
  public getService(): IService<E, F> {
    return this._formData.services[0];
  }

  /**
   *
   * @returns
   */
  public getEntity(): Promise<E> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;
      const entity = { ...this._entity };

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

      if (this._formData == null) {
        const initialReader: IReader<E, F> = createInitialReader();

        this._formData = await initialReader.read(this._entity);

        if (this._reader) {
          this._formData = await this._reader.read(
            this._entity,
            this._formData
          );
        }
      } else {
        this._entity = {} as E;
        this._entity = await this.getEntity();
      }

      //update items map
      let index = 0;
      this._formData.itemsMap = {};
      for await (const item of this._formData.items) {
        this._formData.itemsMap[item.property as keyof E] = index++;
      }

      //form data deep clone
      this._initialFormData = JSON.parse(JSON.stringify(this._formData));

      if (this._formData.services) {
        for await (const service of this._formData?.services) {
          const command = this.getCommandService();

          service.initialize(command);
        }
      }

      resolve(this._formData);
    });
  }
}
