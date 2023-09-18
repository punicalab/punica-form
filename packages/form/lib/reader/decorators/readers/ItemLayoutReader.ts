import { IEntity } from '@punica/common';
import { Form, IFormItem } from '../../..';
import BaseReader from '../base';

class Reader<F extends IFormItem, E extends IEntity> extends BaseReader<F, E> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>) {
    for await (const item of items) {
      const { layout } = item;

      if (!layout) {
        item.layout = { xs: 12 };
      }
    }
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<F>> {
    const form: Form<F> = await super.read(entity);

    this.readItemsData(form.items);

    return form;
  }
}

export default Reader;
