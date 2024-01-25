import { Form, FormItem } from '..';

// Defines a reader interface for reading data into a form.
export interface IReader<E, F extends FormItem<E>> {
  // Reads the entity data and returns a form object.
  // If initialFormData is provided, it will be used as a starting point for the form.
  read(entity: E, initialFormData?: Form<E, F>): Promise<Form<E, F>>;
}
