import { BaseListener } from '@punica/common';
import { WriteToPropertyPath } from '@punica/util';
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
  E,
  F extends FormItem<E>
> extends BaseListener<FormEvents> {
  private _formData: Form<E, F>;
  private _initialFormData: Form<E, F>;
  private _reader: IReader<E, F>;
  private _entity: E;

  //#region constructor

  /**
   *
   * @param formData
   */
  public constructor(formData: Form<E, F>);

  /**
   *
   * @param entity
   * @param reader
   */
  public constructor(entity: E, reader: IReader<E, F>);

  /**
   *
   * @param arrgs
   */
  public constructor(...args: any[]) {
    super();

    if (args.length === 1) {
      const [formData] = args;

      this._formData = formData;
    } else if (args.length === 3) {
      const [entity, reader] = args;

      this._entity = entity;
      this._reader = reader;
    }

    //this.updateValue = this.updateValue.bind(this);
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
        const { property, value, path } = item;

        if (path) {
          WriteToPropertyPath(entity, path, value);
        } else {
          entity[property] = value;
        }
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
        this._entity = await this.getEntity();
      }

      //initializer
      if (this._formData.initializer) {
        this._formData = await this._formData.initializer(
          this._formData,
          this._entity
        );

        //reset items map
        this._formData.itemsMap = {} as Record<keyof E, number>;
      }

      //set update values
      let index = 0;
      for await (const item of this._formData.items) {
        //TODO item.updateValue = this.updateValue;

        this._formData.itemsMap[item.property] = index++;
      }

      //form data deep clone
      this._initialFormData = JSON.parse(JSON.stringify(this._formData));

      for await (const service of this._formData.services) {
        const command = this.getCommandService();

        service.initialize(command);
      }

      resolve(this._formData);
    });
  }
}

/*

public validate(): Promise<boolean> {
  return new Promise(async (resolve) => {
    const { items } = this._formData;
    this._hasError = false;

    for await (const item of items) {
      const { errorChecking, hidden } = item;

      if (errorChecking && !hidden) {
        const command = this.getCommandItem(item);
        const { error, errorMessages } = await errorChecking(command);

        if (error) {
          this._hasError = true;
        }

        item.error = error;
        item.errorMessages = errorMessages;
      }
    }

    this.fireEvent(FormEvents.UPDATE, this._formData);

    resolve(this._hasError);
  });
}

public async reset(): Promise<void> {
  const { items } = this._formData;

  for await (const item of items) {
    item.value = item.initialValue;
  }

  this.fireEvent(FormEvents.RESET, null);
  this.fireEvent(FormEvents.UPDATE, this._formData);
}

public updateValue(property: keyof E, value: any): Promise<void> {
  return new Promise((resolve) => {
    const formItem = this.getItem(property) as F;
    const { control } = formItem;

    formItem.value = value;

    this.writeItems([formItem]);

    if (control) {
      const command = this.getCommandItem(formItem);

      control(command).then((formItems: Array<FormItem>) => {
        this.writeItems(formItems);
        this.fireEvent(FormEvents.UPDATE_ITEM, [formItem, ...formItems]);
        this.fireEvent(FormEvents.UPDATE, this._formData);

        resolve();
      });
    } else {
      this.fireEvent(FormEvents.UPDATE_ITEM, [formItem]);
      this.fireEvent(FormEvents.UPDATE, this._formData);

      resolve();
    }
  });
}

*/
