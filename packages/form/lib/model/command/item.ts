import { FormItem } from '..';

export interface CommandItem<E, F extends FormItem<E>> {
  formItem: F;
  initialEntity: E;
  getItem: (property: keyof E) => F;

  [key: string]: any;
}
