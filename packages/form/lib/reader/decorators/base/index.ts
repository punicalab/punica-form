import { IEntity } from '@punica/common';
import { Form, IFormItem, IReader, GetItem, WriteItems } from '../../../';

abstract class BaseReader<F extends IFormItem, E extends IEntity>
  implements IReader<F, E>
{
  private _form: Form<F>;
  protected reader: IReader<F, E>;

  /**
   *
   * @param reader
   */
  constructor(reader: IReader<F, E>) {
    this.reader = reader;
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
  public getStoreItem(key: string): any {
    return this._form.store.get(key);
  }

  /**
   *
   * @param key
   * @param value
   */
  public setStoreItem(key: string, value: any): void {
    this._form.store.set(key, value);
  }
}

export default BaseReader;
