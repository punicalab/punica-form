import { FormItem, deepCopy, writeToPropertyPath } from '@punica/form';

/** A copy of an entity that holds the values of the items of its form. */
export const valuesOf = <E>(initial: E, items: Array<FormItem<E>>): E => {
  const entity = deepCopy(initial);

  for (const { property, value, path } of items) {
    if (path) {
      writeToPropertyPath(entity as object, path, value);
    } else {
      entity[property] = value;
    }
  }

  return entity;
};
