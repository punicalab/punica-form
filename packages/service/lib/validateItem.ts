import { CommandService, ErrorDetail, FormItem } from '@punica/form';

/** The latest validation of every property, by the form it belongs to. */
const latest = new WeakMap<object, Map<PropertyKey, object>>();

/**
 * Tells the validations of a form that are still running that their results
 * are stale: of one property, or of every property.
 */
export const dropValidations = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property?: keyof E
): void => {
  if (property === undefined) {
    latest.delete(command);
  } else {
    latest.get(command)?.delete(property);
  }
};

/**
 * Validates items one after the other and writes the results onto the items
 * as they are now: an item may have changed while it was validated, and only
 * its error state is what the validation knows. A result is not written when
 * it is stale: the value changed, the item was validated again or reset.
 * Items without a validation function, hidden items and disabled items are
 * not validated.
 * @returns The results, by the property of the validated items
 */
export const validateItems = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  items: F[]
): Promise<Map<keyof E, ErrorDetail>> => {
  const results = new Map<keyof E, ErrorDetail>();
  const finished: Array<{ item: F; run: object }> = [];
  const runs = latest.get(command) ?? new Map<PropertyKey, object>();

  latest.set(command, runs);

  for (const item of items) {
    if (!item.validation || item.hidden || item.disabled) {
      continue;
    }

    const run = {};

    runs.set(item.property, run);

    const { error, errorMessages } = await item.validation(
      command.createCommandItem(item)
    );

    results.set(item.property, { error, errorMessages });
    finished.push({ item, run });
  }

  const written: F[] = [];

  for (const { item, run } of finished) {
    const now = command.getItem(item.property);

    if (
      now &&
      Object.is(now.value, item.value) &&
      latest.get(command)?.get(item.property) === run
    ) {
      written.push({ ...now, ...results.get(item.property) });
    }
  }

  command.setItems(written);

  return results;
};
