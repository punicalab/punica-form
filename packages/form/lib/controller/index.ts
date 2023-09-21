import { BaseListener, IEntity } from '@punica/common';
import { WriteToPropertyPath } from '@punica/util';
import {
  Form,
  IFormItem,
  IReader,
  FormEvents,
  FormItemRegister,
  Command,
  IStoreManager,
  createInitialReader
} from '..';

/**
 *
 */
export class FormController<
  F extends IFormItem,
  E extends IEntity
> extends BaseListener<FormEvents> {
  private _storeManager: IStoreManager;
  private _formData: Form<F>;
  private _entity: E;
  private _reader: IReader<F, E>;
  private _hasError: boolean;

  /**
   *
   * @param storeManager
   * @param formData
   */
  public constructor(storeManager: IStoreManager, formData: Form<F>);

  /**
   *
   * @param storeManager
   * @param entity
   * @param reader
   */
  public constructor(
    storeManager: IStoreManager,
    entity: E,
    reader: IReader<F, E>
  );

  /**
   *
   * @param arrgs
   */
  public constructor(...args: any[]) {
    super();

    if (args.length === 2) {
      const [storeManager, formData] = args;

      this._storeManager = storeManager;
      this._formData = formData;
    } else if (args.length === 3) {
      const [storeManager, entity, reader] = args;

      this._storeManager = storeManager;
      this._entity = entity;
      this._reader = reader;
    }

    this.updateValue = this.updateValue.bind(this);
    this.readStore = this.readStore.bind(this);
    this.writeStore = this.writeStore.bind(this);
  }

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
  protected getCommand(item: F): Command<F, E> {
    return {
      formItem: item,
      entity: this._entity,
      getItem: this.getItem,
      readStore: this.readStore,
      writeStore: this.writeStore
    };
  }

  /**
   *
   * @param property
   * @returns
   */
  public getItem = <F>(property: keyof E): F => {
    const { items, itemsMap } = this._formData;
    const itemIndex = itemsMap[property as string];

    if (!Number.isInteger(itemIndex)) {
      return null;
    }

    return items[itemIndex] as unknown as F;
  };

  /**
   *
   * @param items
   */
  public writeItems = async (items: Array<IFormItem>) => {
    for await (const item of items) {
      const { itemsMap, items } = this._formData;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  };

  /**
   *
   * @param reader
   */
  public start(): Promise<Form<F>> {
    return new Promise(async (resolve) => {
      this.fireEvent(
        FormEvents.REGISTER_ITEMS,
        FormItemRegister.getInstance().getItemKeys()
      );

      if (this._formData == null) {
        const initialReader: IReader<F, E> = createInitialReader();

        this._formData = await initialReader.read(this._entity);

        if (this._reader) {
          this._formData = await this._reader.read(
            this._entity,
            this._formData
          );
        }
      } else {
        //create initial entity
        this._entity = await this.getEntity();
      }

      this._storeManager.setStore(this._formData.store);

      //initializer
      if (this._formData.initializer) {
        this._formData = await this._formData.initializer(
          this._formData,
          this._entity
        );

        //reset items map
        this._formData.itemsMap = {};
      }

      //set update values
      let index = 0;
      for await (const item of this._formData.items) {
        item.updateValue = this.updateValue;

        this._formData.itemsMap[item.property] = index++;
      }

      resolve(this._formData);
    });
  }

  /**
   *
   * @returns
   */
  public getInitialEntity(): IEntity {
    return this._entity;
  }

  /**
   *
   * @param key
   * @returns
   */
  public readStore(key: string): any {
    return this._storeManager.read(key);
  }

  /**
   *
   * @param key
   * @param value
   */
  public writeStore(key: string, value: any): void {
    this._storeManager.write(key, value);
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

        WriteToPropertyPath(entity, property, value);
      }

      resolve(entity);
    });
  }

  /**
   *
   * @returns
   */
  public validate(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;
      this._hasError = false;

      for await (const item of items) {
        const { errorChecking, hidden } = item;

        if (errorChecking && !hidden) {
          const command = this.getCommand(item);
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

  /**
   *
   */
  public async reset(): Promise<void> {
    const { items } = this._formData;

    for await (const item of items) {
      item.value = item.initialValue;
    }

    this.fireEvent(FormEvents.RESET, null);
    this.fireEvent(FormEvents.UPDATE, this._formData);
  }

  /**
   *
   * @param property
   * @param value
   */
  public updateValue(property: keyof E, value: any): Promise<void> {
    return new Promise((resolve) => {
      const formItem = this.getItem(property) as F;
      const { control } = formItem;

      formItem.value = value;

      this.writeItems([formItem]);

      if (control) {
        const command = this.getCommand(formItem);

        control(command).then((formItems: Array<IFormItem>) => {
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
}
