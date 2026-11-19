import { Form, FormItem } from '..';

/**
 * Reads metadata of the entity into the form while the form is started.
 * A reader changes the form it is given.
 */
export interface IReader<E, F extends FormItem<E>> {
  read(entity: E, form: Form<E, F>): void | Promise<void>;
}
