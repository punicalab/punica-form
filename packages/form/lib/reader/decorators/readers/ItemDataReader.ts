import { IEntity } from '@punica/common';
import { Form, IFormItem } from '../../..';
import { ReadPropertyPath } from '@punica/util';
import BaseReader from '../base';

class Reader<F extends IFormItem, E extends IEntity> extends BaseReader<F, E> {
  /**
   *
   * @param entity
   * @param item
   * @returns
   */
  private getPropertyData(entity: E, item: F) {
    const { property } = item;

    if (property.includes('/')) return ReadPropertyPath(entity, property);

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
      item.initialValue = data;
    }
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<F>> {
    const form: Form<F> = await super.read(entity);

    this.readItemsData(entity, form.items);

    return form;
  }
}

export default Reader;
