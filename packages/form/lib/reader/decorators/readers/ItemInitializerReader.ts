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
   * Reads an entity and updates form items with their corresponding data.
   * @param entity - The entity to be read.
   * @returns The form with updated form item values.
   */
  public async read(entity: E): Promise<Form<E, F>> {
    const form: Form<E, F> = await super.read(entity);

    // Read and initialize form items.
    this.readItemsData(form.items);

    return form;
  }
}

export default Reader;
