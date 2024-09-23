import { Form, FormEvents, FormItem } from '..';
import { CommandItem } from '.';

/**
 * Defines the structure of the CommandService.
 */
export type CommandService<E, F extends FormItem<E>> = {
  // The initial form data before any modifications.
  initialForm: Form<E, F>;

  // The initial entity data before any modifications.
  initialEntity: E;

  // The current form data that may have been modified.
  form: Form<E, F>;

  // A mapping of property names to their respective form item index.
  itemsMap: Record<keyof E, number>;

  // Creates a CommandItem from a form item for further processing.
  createCommandItem: (item: F) => Promise<CommandItem<E, F>>;

  // Fires an event to notify listeners of changes in the form.
  fireEvent: (eventType: FormEvents, data: any) => void;

  // Retrieves a form item based on its property name.
  getItem: (property: keyof E) => F;

  // Writes an array of form items to the current form data.
  writeItems: (items: Array<FormItem<E>>) => Promise<void>;
};
