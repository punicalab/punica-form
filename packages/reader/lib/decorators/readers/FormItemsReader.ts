import { IEntity } from '@punica/common';
import { IForm, IFormItem, FormItemRegister } from '@punica/form';
import BaseReader from '../base';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param entity
   * @returns
   */
  private readItem(entity: E): Promise<Array<F>> {
    return new Promise(async (resolve) => {
      const items = new Array<F>();
      const keys = Object.keys(entity);
      const formItemPool: any = {};
      const registeredItems = FormItemRegister.getInstance().getKeys();

      //read form item
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
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);

    form.items = await this.readItem(entity);
    form.itemsMap = {};

    form.items.forEach((item: F, index: number) => {
      form.itemsMap[item.property] = index;
    });

    return form;
  }
}

export default Reader;
