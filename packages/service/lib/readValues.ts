import { CommandService, FormItem, deepCopy } from '@punica/form';
import { hasRows } from './rows';
import { valuesOf } from './valuesOf';

/**
 * A copy of the entity the form was created from, holding the current
 * values. The entity itself is never changed.
 */
export const readValues = <E, F extends FormItem<E>>(
  command: CommandService<E, F>
): E => {
  return valuesOf(
    command.initialEntity,
    command.getForm().items.map((item) =>
      // The values of a list are objects of the form: a copy is handed out
      hasRows(command, item.property)
        ? { ...item, value: deepCopy(item.value) }
        : item
    )
  );
};
