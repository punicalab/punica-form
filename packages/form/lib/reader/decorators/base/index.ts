import { Form, FormItem, IReader, CommandItem } from '../../../';

abstract class BaseReader<E, F extends FormItem<E>> implements IReader<E, F> {
  private _form: Form<E, F>;
  private _entity: E;
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
   * @param item
   * @returns
   */
  protected getCommand(item: F): CommandItem<E, F> {
    return {
      formItem: item,
      entity: this._entity,
      getItem: this.getItem
    };
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<E, F>> {
    this._form = await this.reader.read(entity);

    return this._form;
  }

  /**
   *
   * @param property
   * @returns
   */
  protected getItem(property: keyof E) {
    const { items, itemsMap } = this._form;
    const index = itemsMap[property];
    const item = items[index];

    return item as unknown as F;
  }

  /**
   *
   * @param items
   */
  protected async writeItems(items: Array<FormItem<E>>) {
    for await (const item of items) {
      const { itemsMap, items } = this._form;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  }
}

export default BaseReader;
