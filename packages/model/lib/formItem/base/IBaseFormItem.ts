import { IEntity } from '@punica/common';
import { UpdateValue, UpdatePropertyValue } from '.';

export type IBaseFormItem = {
  type?: string;
  property?: string;
  value?: any;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  hidden?: boolean;
  defaultValue?: any;
  getInitialEntity?: () => IEntity;
  updateValue?: UpdateValue;
  updatePropertyValue?: UpdatePropertyValue;

  [key: string]: any;
};
