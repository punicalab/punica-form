import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>, entity: E) {
    for await (const formItem of items) {
      const { initializer } = formItem;

      if (initializer) {
        const items = await initializer({
          formItem,
          entity,
          getItem: this.getItem
        });

        this.writeItems(items);
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

    this.readItemsData(form.items, entity);

    return form;
  }
}

export default Reader;
