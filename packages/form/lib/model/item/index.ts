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

  /** Whether the value differs from the one the form was started with. */
  dirty?: boolean;

  /** Whether the user has left the field. Set by the `Touch` service. */
  touched?: boolean;

  /** Whether the item is being validated. */
  validating?: boolean;

  /**
   * Milliseconds the `Trigger` service waits before it validates the item.
   * A validation triggered again meanwhile starts the wait anew, so a
   * validation that asks a server runs once the user stops typing.
   */
  validateDebounce?: number;

  /** Whether the last validation of the item failed. */
  error?: boolean;

  /**
   * Makes the item a list of forms, such as the lines of an invoice: returns
   * the entity of a new row, an instance of a form class. The value of the
   * item is then the array of the values of its rows. The rows are created
   * and changed by the `FieldArray` service, which the form has to list.
   */
  row?(): object;

  /** The messages of the last failed validation. */
  errorMessages?: string[];

  // The functions below are declared as methods on purpose: a function whose
  // parameter is typed more precisely, with the item type of your form system
  // or with the features of a service (`CommandItem<E, AppItem<E>, StoreCommand>`),
  // can then be assigned to them.

  /** Runs once while the form is created; the returned items are written to the form. */
  initialize?(
    command: CommandItem<E, FormItem<E>>
  ): Promise<Array<FormItem<E>>>;

  /** Runs after the value of the item was set; the returned items are written to the form. */
  control?(command: CommandItem<E, FormItem<E>>): Promise<Array<FormItem<E>>>;

  /**
   * Validates the item. The services pass a context whose signal is aborted
   * when the result is not needed any more; give it to `fetch` to cancel
   * the request: `fetch(url, { signal: context?.signal })`.
   */
  validation?(
    command: CommandItem<E, FormItem<E>>,
    context?: ValidationContext
  ): Promise<ErrorDetail>;
};

/**
 * A form item whose `value` has the type of its property. Use it as the item
 * type of a form to get checked values after narrowing by `property`:
 *
 * const controller = await FormController.fromEntity<User, TypedFormItem<User>>(user);
 * const item = controller.getForm().items[0];
 * if (item.property === 'age') item.value; // number | undefined
 */
export type TypedFormItem<E, F extends FormItem<E> = FormItem<E>> = {
  [K in keyof E]: Omit<F, 'property' | 'value'> & { property: K; value?: E[K] };
}[keyof E];

/**
 * What a validation function receives besides its command.
 */
export type ValidationContext = {
  /**
   * Aborted when the item is validated again, changed or reset while the
   * validation is running.
   */
  signal: AbortSignal;
};

/**
 * The result of a validation.
 */
export type ErrorDetail = {
  error: boolean;
  errorMessages?: string[];
};
