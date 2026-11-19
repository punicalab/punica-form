import { CommandItem } from '../command';

/**
 * A field of a form. Extend it with the properties of your own form system:
 * `type AppItem<E> = FormItem<E> & { layout?: Layout }`.
 */
export type FormItem<E> = {
  /** The property of the entity this item belongs to. */
  property: keyof E;

  /** Path of the value inside the entity, for nested values (`address/city`). */
  path?: string;

  /** The label or display text of the item. */
  label: string;

  /** The form item type the item was created with. */
  type?: string;

  /**
   * The value of the item. Deliberately `any`: its type depends on the
   * property and on the form item type.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;

  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;

  /** Whether the last validation of the item failed. */
  error?: boolean;

  /** The messages of the last failed validation. */
  errorMessages?: string[];

  /** Runs once while the form is created; the returned items are written to the form. */
  initialize?: (
    command: CommandItem<E, FormItem<E>>
  ) => Promise<Array<FormItem<E>>>;

  /** Runs after the value of the item was set; the returned items are written to the form. */
  control?: (
    command: CommandItem<E, FormItem<E>>
  ) => Promise<Array<FormItem<E>>>;

  /** Validates the item. */
  validation?: (command: CommandItem<E, FormItem<E>>) => Promise<ErrorDetail>;
};

/**
 * The result of a validation.
 */
export type ErrorDetail = {
  error: boolean;
  errorMessages?: string[];
};
