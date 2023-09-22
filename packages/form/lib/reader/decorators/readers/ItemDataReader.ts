import { ReadPropertyPath } from '@punica/util';
import { Form, FormItem } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   *
   * @param entity
   * @param item
   * @returns
   */
  private getPropertyData(entity: E, item: F) {
    const { property, path } = item;

    if (path) return ReadPropertyPath(entity, property as string);

    return entity[property];
  }
  /**
   *
   * @param entity
   * @param items
   */
  private async readItemsData(entity: E, items: Array<F>) {
    for await (const item of items) {
      const data = this.getPropertyData(entity, item);

      item.value = data;
    }
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<E, F>> {
    const form: Form<E, F> = await super.read(entity);

    this.readItemsData(entity, form.items);

    return form;
  }
}

export default Reader;
