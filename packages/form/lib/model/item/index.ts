import { CommandItem } from '../command';

// Represents a form item, which is a field or element in a form.
export type FormItem<E> = {
  // The property associated with the form item.
  property: keyof E;

  // The path for the form item (if applicable).
  path?: string;

  // The label or display text for the form item.
  label: string;

  // Indicates if the form item is required.
  required?: boolean;

  // The type of the form item.
  type?: string;

  // The value of the form item.
  value?: any;

  // Indicates if there is an error associated with the form item.
  error?: boolean;

  // An array of error messages related to the form item.
  errorMessages?: Array<string>;

  // Indicates if the form item is disabled.
  disabled?: boolean;

  // Indicates if the form item is hidden.
  hidden?: boolean;

  // A function to fetch data for the form item (if needed).
  getData?: (params?: any) => Promise<any>;

  // A function to set the value of the form item.
  setValue?: (property: keyof E, value: any) => void;

  // A function to control the form item based on a command.
  control?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;

  // A function called when the form item is submitted.
  submitted?: (command: CommandItem<E, any>) => Promise<void>;

  // A function to initialize the form item.
  initialize?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;

  // A function to validate the form item.
  validation?: (command: CommandItem<E, any>) => Promise<ErrorDetail>;

  // Additional properties can be added here if needed.
  [key: string]: any; // Allows for any additional custom properties to be attached.
};

// Represents detailed error information.
export type ErrorDetail = {
  // Indicates if there is an error.
  error: boolean;

  // An array of error messages.
  errorMessages?: Array<string>;

  // Additional properties can be added here if needed.
  [key: string]: any; // Allows for any additional custom properties to be attached.
};
