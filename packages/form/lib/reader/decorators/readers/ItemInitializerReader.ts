import { Form, FormItem } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   * Reads and initializes form items if they have an 'initialize' function.
   * @param items - Array of form items.
   */
  private async readItemsData(items: Array<F>) {
    for await (const formItem of items) {
      const { initialize } = formItem;

      if (initialize) {
        // Call the 'initialize' function of the form item with a command item.
        const items = await initialize(super.getCommand(formItem));

        // Write the updated items back to the form.
        this.writeItems(items);
      }
    }
  }

  /**
   * Reads form data from the entity.
   * @param {E} entity - The entity to read form data from.
   * @param form
   */
  public async read(entity: E, form: Form<E, F>): Promise<void> {
    await super.read(entity, form);

    // Read and initialize form items.
    this.readItemsData(form.items);
  }
}

export default Reader;
