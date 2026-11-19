import { FormItem } from '..';

/**
 * What the functions of a form item (initialize, control, validation) receive.
 * `C` holds the features services add, such as the functions of `Store`.
 */
export type CommandItem<
  E,
  F extends FormItem<E>,
  C = Record<string, unknown>
> = {
  /** A copy of the item the function belongs to. */
  formItem: F;

  /** The entity the form was created from. */
  initialEntity: E;

  /** A copy of another item of the form. */
  getItem: (property: keyof E) => F | undefined;
} & C;
