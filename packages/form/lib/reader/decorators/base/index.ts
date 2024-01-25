import { Form, FormItem, IReader, CommandItem } from '../../../';

/**
 * Abstract base class for reading form data.
 */
abstract class BaseReader<E, F extends FormItem<E>> implements IReader<E, F> {
  #form: Form<E, F>;
  #entity: E;
  protected reader: IReader<E, F>;

  /**
   * Creates an instance of BaseReader.
   * @param {IReader<E, F>} reader - The reader to be used for reading form data.
   */
  constructor(reader: IReader<E, F>) {
    this.reader = reader;
  }

  /**
   * Gets a command item for a form item.
   * @param {F} item - The form item.
   * @returns {CommandItem<E, F>} - The command item.
   */
  protected getCommand(item: F): CommandItem<E, F> {
    return {
      formItem: item,
      initialEntity: this.#entity,
      getItem: this.getItem
    };
  }

  /**
   * Reads form data from the entity.
   * @param {E} entity - The entity to read form data from.
   * @returns {Promise<Form<E, F>>} - Resolves to the form data.
   */
  public async read(entity: E): Promise<Form<E, F>> {
    this.#entity = entity;
    this.#form = await this.reader.read(entity);

    return this.#form;
  }

  /**
   * Gets a form item by property.
   * @param {keyof E} property - The property of the form item.
   * @returns {F} - The form item.
   */
  protected getItem(property: keyof E): F {
    const { items, itemsMap } = this.#form;
    const index = itemsMap[property];
    const item = items[index];

    return item as F;
  }

  /**
   * Writes form items.
   * @param {Array<FormItem<E>>} items - The form items to be written.
   */
  protected async writeItems(items: Array<FormItem<E>>): Promise<void> {
    for (const item of items) {
      const { itemsMap } = this.#form;
      const { property } = item;
      const index = itemsMap[property];

      this.#form.items[index] = item as F;
    }
  }
}

export default BaseReader;
