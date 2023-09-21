import { IEntity } from '@punica/common';
import { Form, IFormItem } from '../../..';
import BaseReader from '../base';

class Reader<F extends IFormItem, E extends IEntity> extends BaseReader<F, E> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>) {
    for await (const formItem of items) {
      const { initializer } = formItem;

      if (initializer) {
        const items = await initializer(super.getCommand(formItem));

        this.writeItems(items);
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
