import { Form, FormItem, FormItemRegister } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   * Creates form items from the entity.
   * @param entity - The entity to be read
   * @returns Promise<Array<F>> - Created form items
   */
  private async createFormItemsFromEntity(entity: E): Promise<Array<F>> {
    const items: F[] = [];
    const formItemPool: Record<string, any> = {};
    const registeredItems = FormItemRegister.getInstance().getItemKeys();

    for (const property of registeredItems) {
      const meta = Reflect.getMetadata(property, entity) as
        | Record<string, any>
        | undefined;
      if (meta) Object.assign(formItemPool, meta);
    }

    for (const key of Object.keys(entity as object)) {
      const formItem = formItemPool[key];

      if (!formItem) continue;

      items.push({ ...formItem, property: key } as F);
    }

    return items;
  }

  /**
   * Reads form data from the entity.
   * @param {E} entity - The entity to read form data from.
   * @param form
   */
  public async read(entity: E, form: Form<E, F>): Promise<void> {
    await super.read(entity, form);
    // Create form items from the entity
    form.items = await this.createFormItemsFromEntity(entity);
  }
}

export default Reader;
