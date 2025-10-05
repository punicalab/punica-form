import { Form, FormItem, IReader, CommandItem } from '../../../';

/**
 * Abstract base class for reading form data.
 */
abstract class BaseReader<E, F extends FormItem<E>> implements IReader<E, F> {
  #form: Form<E, F>;
  #entity: E;
  #itemsMap: Record<keyof E, number>;
  protected reader: IReader<E, F>;

  /**
   * Creates an instance of BaseReader.
   * @param {IReader<E, F>} reader - The reader to be used for reading form data.
   */
  constructor(reader: IReader<E, F>) {
    this.reader = reader;
  }

  /**
   * Maps form items to their properties.
   */
  private mapFormItems(): void {
    if (this.#itemsMap) {
      return;
    }

    let index = 0;

    if (this.#form.items) {
      this.#itemsMap = {} as Record<keyof E, number>;
      for (const item of this.#form.items) {
        this.#itemsMap[item.property] = index++;
      }
    }
  }

  /**
   * Gets a command item for a form item.
   * @param {F} item - The form item.
   * @returns {CommandItem<E, F>} - The command item.
   */
  protected getCommand(item: F): CommandItem<E, F> {
    const self = this;

    const getItem = (property: keyof E): F => {
      const { items } = self.#form;
      const index = self.#itemsMap[property];
      const item = items[index];

      return item as F;
    };

    return {
      formItem: item,
      initialEntity: self.#entity,
      getItem: getItem
    };
  }

  /**
   * Reads form data from the entity.
   * @param {E} entity - The entity to read form data from.
   * @param form
   */
  public async read(entity: E, form: Form<E, F>): Promise<void> {
    this.#entity = entity;
    this.#form = form;

    await this.reader.read(entity, this.#form, this.#itemsMap);

    this.mapFormItems();
  }

  /**
   * Writes form items.
   * @param {Array<FormItem<E>>} items - The form items to be written.
   */
  protected async writeItems(items: Array<FormItem<E>>): Promise<void> {
    for (const item of items) {
      const { property } = item;
      const index = this.#itemsMap[property];

      this.#form.items[index] = item as F;
    }
  }
}

export default BaseReader;
