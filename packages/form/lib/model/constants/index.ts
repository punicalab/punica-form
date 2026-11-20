import { Form, FormItem } from '..';

/**
 * The events of a form controller, mapped to the payload of each event.
 */
export type FormEventMap<E, F extends FormItem<E>> = {
  /** The form changed. Fired after every change of the state. */
  UPDATE_FORM: Form<E, F>;

  /** The form was reset to its initial state. Fired after UPDATE_FORM. */
  RESET: Form<E, F>;

  /** A value was set: the changed item, then the items its control returned. */
  UPDATE_ITEM: F[];

  /** The form was submitted: the values the submit handler received. */
  SUBMIT: E;

  /** A submit failed: what the validation or the submit handler threw. */
  SUBMIT_ERROR: unknown;

  /** The registered form item types. Fired at the beginning of start(). */
  REGISTER_ITEMS: string[];
};

export type FormEvents = keyof FormEventMap<unknown, FormItem<unknown>>;
