import { IConverter } from '@punica/converter';
import { CommandItem } from '../command';
import { ErrorDetail } from './model';

export type FormItem<E> = {
  property: keyof E;
  path?: string;
  label: string;
  required?: boolean;
  type?: string;
  value?: any;
  error?: boolean;
  errorMessages?: Array<string>;
  disabled?: boolean;
  hidden?: boolean;
  getData?: (params?: any) => Promise<any>;
  updateValue?: (property: string, value: any) => void;
  control?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;
  submit?: (command: CommandItem<E, any>) => Promise<boolean>;
  initializer?: (command: CommandItem<E, any>) => Promise<Array<FormItem<E>>>;
  errorChecking?: (comman: CommandItem<E, any>) => Promise<ErrorDetail>;
  converter?: {
    input: IConverter<any, any>;
    output: IConverter<any, any>;
  };

  [key: string]: any;
};
