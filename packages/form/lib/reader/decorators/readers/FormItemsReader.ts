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

        items.push(formItem);
      }

      resolve(items);
    });
  }

  /**
   * Creates the form from the entity.
   * @param entity - The entity to be read
   * @returns Promise<Form<E, F>> - Created form
   */
  public async read(entity: E): Promise<Form<E, F>> {
    const form: Form<E, F> = await super.read(entity);

    // Create form items from the entity
    form.items = await this.createFormItemsFromEntity(entity);
    form.itemsMap = {} as Record<keyof E, number>;

    // Create a map of form items
    form.items.forEach((item: F, index: number) => {
      form.itemsMap[item.property] = index;
    });

    return form;
  }
}

export default Reader;
