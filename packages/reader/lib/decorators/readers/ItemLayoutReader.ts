import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
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
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);

    this.readItemsData(form.items);

    return form;
  }
}

export default Reader;
