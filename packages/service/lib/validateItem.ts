import { CommandService, ErrorDetail, FormItem } from '@punica/form';

/**
 * Runs the validation of an item.
 * @returns The result of the validation, or `undefined` when the item is not
 * validated (no validation function, or hidden)
 */
export const validateItem = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  item: F
): Promise<ErrorDetail | undefined> => {
  if (!item.validation || item.hidden) {
    return undefined;
  }

  const { error, errorMessages } = await item.validation(
    command.createCommandItem(item)
  );

  return { error, errorMessages };
};

/**
 * Writes validation results onto the items as they are now: an item may
 * have changed while the form was validated, and only its error state is
 * what the validation knows.
 */
export const writeResults = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  results: Map<keyof E, ErrorDetail>
): void => {
  const items: F[] = [];

  for (const [property, result] of results) {
    const item = command.getItem(property);

    if (item) items.push({ ...item, ...result });
  }

  command.setItems(items);
};
