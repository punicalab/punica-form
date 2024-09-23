import { Form, FormItem } from '..';

/**
 * Interface representing a Starter for initializing form data.
 */
export interface IStarter<E, F extends FormItem<E>> {
  /**
   * Function to run the starter logic.
   * @param form - The current form data.
   * @param entity - The entity associated with the form.
   * @returns A Promise that resolves to the updated form data after initialization.
   */
  run: (form: Form<E, F>, entity: E) => Promise<Form<E, F>>;
}
