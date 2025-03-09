import { Form, FormItem, FormItemRegister } from '../../..';
import BaseReader from '../base';

class Reader<E, F extends FormItem<E>> extends BaseReader<E, F> {
  /**
   * Creates form items from the entity.
   * @param entity - The entity to be read
   * @returns Promise<Array<F>> - Created form items
   */
  private createFormItemsFromEntity(entity: E): Promise<Array<F>> {
    return new Promise(async (resolve) => {
      const items = new Array<F>();
      const keys = Object.keys(entity);
      const formItemPool: any = {};
      const registeredItems = FormItemRegister.getInstance().getItemKeys();

      // Read metadata from the entity and create form items
      for (const property of registeredItems) {
        const formItems = Reflect.getMetadata(property, entity);

        for (const key in formItems) {
          formItemPool[key] = { ...formItems[key] };
        }
      }

      for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const formItem = formItemPool[key];

        if (!formItem) {
          continue;
        }

        formItem.property = key;

        items.push({ ...formItem });
      }

      resolve(items);
    });
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
