import { Form, FormItem } from '..';

export interface IReader<E, F extends FormItem<E>> {
  read(entity: E, initialFormData?: Form<E, F>): Promise<Form<E, F>>;
}
