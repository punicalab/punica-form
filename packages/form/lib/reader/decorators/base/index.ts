import { Form, FormItem, IReader, CommandItem } from '../../../';

abstract class BaseReader<E, F extends FormItem<E>> implements IReader<E, F> {
  #form: Form<E, F>;
  #entity: E;
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
      initialEntity: this.#entity,
      getItem: this.getItem
    };
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<E, F>> {
    this.#form = await this.reader.read(entity);

    return this.#form;
  }

  /**
   *
   * @param property
   * @returns
   */
  protected getItem(property: keyof E) {
    const { items, itemsMap } = this.#form;
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
      const { itemsMap, items } = this.#form;
      const { property } = item;
      const index = itemsMap[property];

      items[index] = item as F;
    }
  }
}

export default BaseReader;
