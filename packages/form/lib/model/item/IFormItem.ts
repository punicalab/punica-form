import {
  FormItemControl,
  FormItemConverter,
  FormItemError,
  FormItemGetData,
  FormItemInitializer,
  FormItemLayout,
  FormItemSubmit,
  FormItemUpdateValue
} from './model';

export interface IFormItem {
  label: string;
  required?: boolean;
  converter?: FormItemConverter;
  layout?: FormItemLayout;
  type?: string;
  property?: string;
  value?: any;
  initialValue?: any;
  error?: boolean;
  errorMessages?: Array<string>;
  disabled?: boolean;
  hidden?: boolean;
  getData?: FormItemGetData;
  updateValue?: FormItemUpdateValue;
  errorChecking?: FormItemError;
  control?: FormItemControl;
  submit?: FormItemSubmit;
  initializer?: FormItemInitializer;

  [key: string]: any;
}
