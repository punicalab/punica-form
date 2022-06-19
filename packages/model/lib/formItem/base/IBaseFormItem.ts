import { IEntity } from '@punica/common';
import { Renderer, UpdateValue, UpdatePropertyValue } from '.';

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
  renderer?: Renderer;
  updateValue?: UpdateValue;
  updatePropertyValue?: UpdatePropertyValue;

  [key: string]: any;
};
