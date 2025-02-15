import { FormItem, IReader, IService, IStarter } from '../..';

// Defines the structure of a form, which may contain items and services.
export type Form<E = any, F extends FormItem<E> = any> = {
  // An array of form items.
  items: Array<F>;

  // An array of services associated with the form.
  services?: Array<IService>;

  // An array of reader associated with the form.
  readers?: Array<IReader<E, F>>;

  // An array of starters associated with the form.
  starters?: Array<IStarter<E, F>>;

  // Additional properties can be added here if needed.
  // Allows for any additional custom properties to be attached.
  [key: string]: any;
};
