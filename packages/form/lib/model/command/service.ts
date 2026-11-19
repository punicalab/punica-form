import { CommandItem, Form, FormEventMap, FormItem } from '..';

/**
 * What a service receives when it is initialized: the only way to read and
 * change the state of the form.
 */
export type CommandService<E, F extends FormItem<E>> = {
  /** The entity the form was created from. */
  initialEntity: E;

  /** The current form. */
  getForm: () => Form<E, F>;

  /** The items as they were when the form was started. */
  getInitialItems: () => F[];

  /** The current item of a property. */
  getItem: (property: keyof E) => F | undefined;

  /**
   * Replaces the items with the same properties. The form gets a new
   * reference and UPDATE_FORM is fired. Unknown properties are ignored.
   */
  setItems: (items: Array<FormItem<E>>) => void;

  /**
   * Marks the pending asynchronous writes of a property, or of the whole
   * form when no property is given, as superseded by a newer one.
   * @returns A function that tells whether this write is still the newest
   */
  supersede: (property?: keyof E) => () => boolean;

  /** Fires an event of the controller. */
  emit: <K extends keyof FormEventMap<E, F>>(
    event: K,
    payload: FormEventMap<E, F>[K]
  ) => void;

  /** Creates what the functions of a form item receive. */
  createCommandItem: (item: F) => CommandItem<E, F>;
};
