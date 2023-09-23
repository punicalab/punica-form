import { CommandItem } from '../command';

export type FormItem<E> = {
  property: keyof E;
  path?: string;
  label: string;
  required?: boolean;
  type?: string;
  value?: any;
  statusMessage?: Array<string>;
  error?: boolean;
  errorMessages?: Array<string>;
  disabled?: boolean;
  hidden?: boolean;
  getData?: (params?: any) => Promise<any>;
  updateValue?: (property: string, value: any) => void;
  control?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;
  submited?: (command: CommandItem<E, any>) => Promise<void>;
  initialize?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;
  validation?: (comman: CommandItem<E, any>) => Promise<ErrorDetail>;

  [key: string]: any;
};

export type ErrorDetail = {
  error: boolean;
  errorMessages?: Array<string>;

  [key: string]: any;
};
