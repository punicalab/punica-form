import { FormItem, IService } from '../..';

// Defines the structure of a form, which may contain items and services.
export type Form<E, F extends FormItem<E>> = {
  // An array of form items.
  items?: Array<F>;

  // An array of services associated with the form.
  services?: Array<IService>;

  // Additional properties can be added here if needed.
  [key: string]: any; // Allows for any additional custom properties to be attached.
};
