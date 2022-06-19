import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '@punica/form-model';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>, entity: E) {
    await items.forEach(async (formItem: F) => {
      const { control } = formItem;

      if (control) {
        const items = await control({
          formItem,
          readItems: super.readItems,
          entity
        });

        super.writeItems(items);
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
