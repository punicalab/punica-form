import { FormItem, writeToPropertyPath } from '@punica/form';
import { StandardIssue, StandardSchema } from './standard';

/** The keys of the path of an issue. */
const keysOf = (issue: StandardIssue): string[] => {
  return (issue.path ?? []).map((segment) =>
    String(typeof segment === 'object' ? segment.key : segment)
  );
};

/** The keys of the value of an item inside the values of its form. */
const keysOfItem = <E>(item: FormItem<E>): string[] => {
  return item.path
    ? item.path.split('/').filter(Boolean)
    : [String(item.property)];
};

/** The messages of the issues of a value; none for a valid one. */
export const validate = async (
  schema: StandardSchema,
  value: unknown
): Promise<ReadonlyArray<StandardIssue>> => {
  const result = await schema['~standard'].validate(value);

  return result.issues ?? [];
};

/** The values of the items of a form as one plain object. */
export const valuesOf = <E>(
  items: Array<FormItem<E>>
): Record<string, unknown> => {
  const values: Record<string, unknown> = {};

  for (const item of items) {
    if (item.path) {
      writeToPropertyPath(values, item.path, item.value);
    } else {
      values[String(item.property)] = item.value;
    }
  }

  return values;
};

/** The issues of a form, sorted by the item they belong to. */
export type Sorted<E> = {
  /** The messages of an item, by its property. */
  items: Map<keyof E, string[]>;

  /** The messages that belong to no item, with the path they are about. */
  form: string[];
};

/**
 * Sorts issues by the item they are about: the item whose value holds the
 * path of the issue. An issue about `address.city` belongs to the item of
 * the path `address/city`, or else to the one of `address`.
 */
export const sort = <E>(
  issues: ReadonlyArray<StandardIssue>,
  items: Array<FormItem<E>>
): Sorted<E> => {
  const sorted: Sorted<E> = { items: new Map(), form: [] };

  for (const issue of issues) {
    const keys = keysOf(issue);
    let owner: FormItem<E> | undefined;
    let depth = 0;

    for (const item of items) {
      const own = keysOfItem(item);

      if (
        own.length > depth &&
        own.length <= keys.length &&
        own.every((key, index) => key === keys[index])
      ) {
        owner = item;
        depth = own.length;
      }
    }

    if (owner) {
      sorted.items.set(owner.property, [
        ...(sorted.items.get(owner.property) ?? []),
        issue.message
      ]);
    } else {
      sorted.form.push(
        keys.length ? `${keys.join('.')}: ${issue.message}` : issue.message
      );
    }
  }

  return sorted;
};
