import { ReadPropertyPath } from '@punica/util';
import { Form, FormItem } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   * Retrieves the data for a specific property of the entity.
   * @param entity - The entity from which to retrieve data.
   * @param item - The form item that specifies the property and path.
   * @returns The data for the specified property.
   */
  private getPropertyData(entity: E, item: F) {
    const { property, path } = item;

    if (path) return ReadPropertyPath(entity, property as string);

    return entity[property];
  }

  /**
   * Reads data for each form item and updates their values.
   * @param entity - The entity from which to read data.
   * @param items - The array of form items to update.
   */
  private async readItemsData(entity: E, items: Array<F>) {
    for await (const item of items) {
      const data = this.getPropertyData(entity, item);

      item.value = data;
    }
  }

  /**
   * Reads the entity and updates form items with their corresponding data.
   * @param entity - The entity to be read.
   * @returns The form with updated form item values.
   */
  public async read(entity: E): Promise<Form<E, F>> {
    const form: Form<E, F> = await super.read(entity);

    await this.readItemsData(entity, form.items);

    return form;
  }
}

export default Reader;
