import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import { ReadPropertyPath } from '@punica/util';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param entity
   * @param item
   * @returns
   */
  private getPropertyData(entity: E, item: F) {
    const { property, propertyPath } = item;

    if (propertyPath) return ReadPropertyPath(entity, propertyPath);

    return entity[property];
  }
  /**
   *
   * @param entity
   * @param items
   */
  private async readItemsData(entity: E, items: Array<F>) {
    await items.forEach((item: F) => {
      const data = this.getPropertyData(entity, item);

      item.value = data;
      item.defaultValue = data;
    });
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);

    this.readItemsData(entity, form.items);

    return form;
  }
}

export default Reader;
