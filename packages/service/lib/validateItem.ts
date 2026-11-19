import { CommandService, FormItem } from '@punica/form';

/**
 * Runs the validation of an item.
 * @returns The item with the result of the validation, or `undefined` when
 * the item is not validated (no validation function, or hidden)
 */
export const validateItem = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  item: F
): Promise<F | undefined> => {
  if (!item.validation || item.hidden) {
    return undefined;
  }

  const { error, errorMessages } = await item.validation(
    command.createCommandItem(item)
  );

  // The item may have changed while it was validated: keep its latest state
  return { ...(command.getItem(item.property) ?? item), error, errorMessages };
};
