import { IEntity } from '@punica/common';
import {
  Form,
  IFormItem,
  IReader,
  GetItem,
  WriteItems,
  Command
} from '../../../';

abstract class BaseReader<F extends IFormItem, E extends IEntity>
  implements IReader<F, E>
{
  private _form: Form<F>;
  private _entity: E;
  protected reader: IReader<F, E>;

  /**
   *
   * @param reader
   */
  constructor(reader: IReader<F, E>) {
    this.reader = reader;

    this.readStore = this.readStore.bind(this);
    this.writeStore = this.writeStore.bind(this);
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
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<F>> {
    this._form = await this.reader.read(entity);

    return this._form;
  }

  /**
   *
   * @param property
   * @returns
   */
  protected getItem: GetItem = <F>(property: string): F => {
    const { items, itemsMap } = this._form;
    const index = itemsMap[property];
    const item = items[index];

    return item as unknown as F;
  };

  /**
   *
   * @param items
   */
  protected writeItems: WriteItems = async (items: Array<IFormItem>) => {
    for await (const item of items) {
      const { itemsMap, items } = this._form;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  };

  /**
   *
   * @param key
   * @returns
   */
  protected readStore = (key: string): any => {
    return this._form.store[key];
  };

  /**
   *
   * @param key
   * @param value
   */
  protected writeStore = (key: string, value: any) => {
    this._form.store[key] = value;
  };
}

export default BaseReader;
