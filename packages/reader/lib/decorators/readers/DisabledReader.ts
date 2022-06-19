import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>, entity: E) {
    await items.forEach(async (item: F) => {
      const { disabledChecking } = item;

      if (disabledChecking) {
        const disabled = await disabledChecking({
          formItem: item,
          readItems: this.readItems,
          entity
        });

        item.disabled = disabled;
      }
    });
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
