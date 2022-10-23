import { IEntity } from '@punica/common';
import { WriteToPropertyPath } from '@punica/util';
import { BaseListener } from '@punica/common';
import {
  IForm,
  IFormItem,
  IReader,
  GetItem,
  WriteItems,
  FormEvents,
  IFormController,
  FormItemRegister
} from '..';

/**
 *
 */
export abstract class BaseFormController<E extends IEntity, F extends IFormItem>
  extends BaseListener
  implements IFormController<E, F>
{
  protected _formData: IForm<F>;
  protected _entity: E;
  protected _hasError: boolean;

  /**
   *
   * @param entity
   */
  constructor(entity: E) {
    super();

    this._entity = entity;

    this.updateValue = this.updateValue.bind(this);
    this.getInitialEntity = this.getInitialEntity.bind(this);
    this.updatePropertyValue = this.updatePropertyValue.bind(this);
    this.getStoreItem = this.getStoreItem.bind(this);
    this.setStoreItem = this.setStoreItem.bind(this);
  }

  /**
   *
   * @param property
   * @returns
   */
  protected getItem: GetItem = <F>(property: string): F => {
    const { items, itemsMap } = this._formData;
    const itemIndex = itemsMap[property];

    if (!Number.isInteger(itemIndex)) {
      return null;
    }

    return items[itemIndex] as unknown as F;
  };

  /**
   *
   * @param items
   */
  protected writeItems: WriteItems = async (items: Array<IFormItem>) => {
    for await (const item of items) {
      const { itemsMap, items } = this._formData;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  };

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
   * @param reader
   */
  public start(
    reader: IReader<E, F>,
    formData: IForm<F> = null
  ): Promise<IForm<F>> {
    return new Promise(async (resolve) => {
      let updateMaps = false;

      this.fireEvent(
        FormEvents.REGISTER_ITEMS,
        FormItemRegister.getInstance().getKeys()
      );

      if (formData) {
        this._formData = formData;
      } else {
        this._formData = await reader.read(this._entity);
      }

      //initializer
      if (this._formData.initializer) {
        this._formData = await this._formData.initializer(
          this._formData,
          this._entity
        );

        //reset items map
        this._formData.itemsMap = {};
        updateMaps = true;
      }

      //set update values
      let index = 0;
      for await (const item of this._formData.items) {
        item.updateValue = this.updateValue;
        item.updatePropertyValue = this.updatePropertyValue;
        item.getInitialEntity = this.getInitialEntity;
        item.getStoreItem = this.getStoreItem;
        item.setStoreItem = this.setStoreItem;

        if (updateMaps) {
          this._formData.itemsMap[item.property] = index++;
        }
      }

      resolve(this._formData);
    });
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
        const { property, value, propertyPath } = item;
        let writePath = property;

        if (propertyPath) {
          writePath = propertyPath;
        }

        WriteToPropertyPath(entity, writePath, value);
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
          const { error, errorMessage } = await errorChecking({
            formItem: item,
            entity: this._entity,
            getItem: this.getItem,
            store: { get: this.getStoreItem, set: this.setStoreItem }
          });

          if (error) {
            this._hasError = true;
          }

          item.error = error;
          item.errorMessage = errorMessage;
        }
      }

      this.fireEvent(FormEvents.UPDATE, this._formData);

      resolve(this._hasError);
    });
  }

  /**
   *
   */
  public reset(): void {
    this._formData.items.forEach((formItem: F) => {
      formItem.value = formItem.defaultValue;
    });

    this.fireEvent(FormEvents.RESET, null);
    this.fireEvent(FormEvents.UPDATE, this._formData);
  }

  /**
   *
   * @param property
   * @param key
   * @param value
   */
  public updatePropertyValue(property: string, key: string, value: any): void {
    const item = this.getItem(property);

    item[key] = value;

    this.writeItems([item]);
    this.fireEvent(FormEvents.UPDATE_PROPERTY_VALUE, {
      property,
      key,
      value
    });
    this.fireEvent(FormEvents.UPDATE, this._formData);
  }

  /**
   * @returns
   */
  public submitControl(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const { items } = this._formData;

      for await (const item of items) {
        const { submit } = item;

        if (submit) {
          await submit({
            formItem: item,
            entity: this._entity,
            getItem: this.getItem,
            store: { get: this.getStoreItem, set: this.setStoreItem }
          });
        }
      }

      resolve(true);
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
  public getStoreItem(key: string): any {
    return this._formData.store.get(key);
  }

  /**
   *
   * @param key
   * @param value
   */
  public setStoreItem(key: string, value: any): void {
    this._formData.store.set(key, value);
  }

  /**
   *
   * @param property
   * @param value
   */
  abstract updateValue(property: string, value: any): void;
}
