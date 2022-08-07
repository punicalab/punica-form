import { IEntity } from '@punica/common';
import {
  IForm,
  IFormItem,
  IReader,
  GetItem,
  WriteItems
} from '@punica/form-model';

abstract class BaseReader<E extends IEntity, F extends IFormItem>
  implements IReader<E, F>
{
  private _form: IForm<F>;
  protected reader: IReader<E, F>;

  /**
   *
   * @param reader
   */
  constructor(reader: IReader<E, F>) {
    this.reader = reader;
  }

  /**
   *
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    this._form = await this.reader.read(entity);

    return this._form;
  }

  /**
   *
   * @param properties
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
   * @param writes
   */
  protected writeItems: WriteItems = (writes: Array<IFormItem>): void => {
    writes.forEach((item: IFormItem) => {
      const { itemsMap, items } = this._form;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    });
  };
}

export default BaseReader;
