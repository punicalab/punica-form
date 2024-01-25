import { FormItem } from '..';

// Defines a structure for a CommandItem, which represents a form item and associated data.
export interface CommandItem<E, F extends FormItem<E>> {
  // The form item that this command item relates to.
  formItem: F;

  // The initial entity data before any modifications (optional).
  initialEntity?: E;

  // A function to retrieve a form item by its property name (optional).
  getItem?: (property: keyof E) => F;

  // Additional properties can be added here if needed
  [key: string]: any; // Allows for any additional custom properties to be attached.
}
