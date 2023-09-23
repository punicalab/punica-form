import { Form, FormItem } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   *
   * @param items
   */
  private async readItemsData(items: Array<F>) {
    for await (const formItem of items) {
      const { initialize } = formItem;

      if (initialize) {
        const items = await initialize(super.getCommand(formItem));

        this.writeItems(items);
      }
    }
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<Form<E, F>> {
    const form: Form<E, F> = await super.read(entity);

    this.readItemsData(form.items);

    return form;
  }
}

export default Reader;
