import { FormItem, IReader, IService, IStarter } from '../..';

/**
 * What a form knows about itself as a whole. A started form always has it.
 */
export type FormState = {
  /** Whether the value of an item differs from the one the form was started with. */
  dirty: boolean;

  /** Whether the user has left a field. */
  touched: boolean;

  /**
   * Whether no item is in error, and the form as a whole is valid when it
   * has validations of its own.
   */
  valid: boolean;

  /** Whether an item is being validated. */
  validating: boolean;

  /** Whether the form is being submitted. */
  submitting: boolean;

  /** How many times a submit was attempted. */
  submitCount: number;

  /** Errors of the form as a whole, such as a rejected submit. */
  errors: string[];
};

/** The part of the state services write; the rest follows from the items. */
export type FormStatePatch = Partial<
  Pick<FormState, 'submitting' | 'submitCount' | 'errors'>
> & {
  /**
   * Whether the form as a whole is not valid, whatever its items say: a
   * validation of the form found something. It stays until it is set again.
   */
  invalid?: boolean;
};

/**
 * The state of a form. Readers and starters may attach their own properties
 * (a title, a layout, …), which are read back as `unknown`.
 */
export type Form<E, F extends FormItem<E> = FormItem<E>> = {
  items: F[];
  /** Set when the form is started and kept up to date after every change. */
  state?: FormState;
  /** Service classes (one instance per form) or instances. */
  services?: Array<IService | (new () => IService)>;
  readers?: Array<IReader<E, F>>;
  starters?: Array<IStarter<E, F>>;
  [key: string]: unknown;
};
