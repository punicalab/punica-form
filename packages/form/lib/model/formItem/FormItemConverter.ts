import { IConverter } from '@punica/converter';

export type FormItemConverter = {
  input: IConverter<any, any>;
  output: IConverter<any, any>;
};
