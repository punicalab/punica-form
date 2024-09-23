import { Form, FormItem } from '..';

// Defines a reader interface for reading data into a form.
export interface IReader<E, F extends FormItem<E>> {
  // Reads the entity data and returns a form object.
  // If form is provided, it will be used as a starting point for the form.
  read(entity: E, form: Form<E, F>): Promise<void>;
}
