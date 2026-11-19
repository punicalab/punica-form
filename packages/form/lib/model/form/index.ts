import { FormItem, IReader, IService, IStarter } from '../..';

/**
 * The state of a form. Readers and starters may attach their own properties
 * (a title, a layout, …), which are read back as `unknown`.
 */
export type Form<E, F extends FormItem<E> = FormItem<E>> = {
  items: F[];
  /** Service classes (one instance per form) or instances. */
  services?: Array<IService | (new () => IService)>;
  readers?: Array<IReader<E, F>>;
  starters?: Array<IStarter<E, F>>;
  [key: string]: unknown;
};
