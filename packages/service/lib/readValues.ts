import {
  CommandService,
  FormItem,
  deepCopy,
  writeToPropertyPath
} from '@punica/form';

/**
 * A copy of the entity the form was created from, holding the current
 * values. The entity itself is never changed.
 */
export const readValues = <E, F extends FormItem<E>>(
  command: CommandService<E, F>
): E => {
  const entity = deepCopy(command.initialEntity);

  for (const { property, value, path } of command.getForm().items) {
    if (path) {
      writeToPropertyPath(entity as object, path, value);
    } else {
      entity[property] = value;
    }
  }

  return entity;
};
