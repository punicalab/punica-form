import { readPropertyPath } from '@punica/util';
import {
  DECORATOR_READERS,
  DECORATOR_SERVICES,
  DECORATOR_STARTERS,
  Form,
  FormItem,
  IReader,
  getFormItemProperties,
  getFormProperty
} from '..';
import { FORM_ITEMS } from '../define/FormItem';

/**
 * Creates the reader that turns an entity into a form:
 *
 * 1. the services, readers and starters of the class decorators
 * 2. one item for every decorated property the entity holds, in the order
 *    of the properties
 * 3. the values of the entity
 * 4. the `initialize` function of every item that has one
 */
export const createInitialReader = <
  E extends object,
  F extends FormItem<E>
>(): IReader<E, F> => ({
  async read(entity: E, form: Form<E, F>): Promise<void> {
    form.services = getFormProperty(entity, DECORATOR_SERVICES);
    form.readers = getFormProperty(entity, DECORATOR_READERS);
    form.starters = getFormProperty(entity, DECORATOR_STARTERS);

    const definitions = getFormItemProperties<F>(entity, FORM_ITEMS);

    form.items = (Object.keys(entity) as Array<keyof E & string>)
      .filter((property) => definitions[property])
      .map((property) => {
        const item: F = { ...definitions[property], property };

        return {
          ...item,
          value: item.path
            ? readPropertyPath(entity, item.path)
            : entity[property]
        };
      });

    const getItem = (property: keyof E) => {
      return form.items.find((item) => item.property === property);
    };

    for (const { property, initialize } of form.items) {
      if (!initialize) continue;

      const initialized = await initialize({
        formItem: getItem(property) as F,
        initialEntity: entity,
        getItem
      });

      for (const item of initialized) {
        const index = form.items.findIndex((i) => i.property === item.property);

        if (index >= 0) form.items[index] = item as F;
      }
    }
  }
});
