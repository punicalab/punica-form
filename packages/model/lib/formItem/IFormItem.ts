import { IBaseFormItem } from './base';
import {
  FormItemConverter,
  FormItemError,
  FormItemControl,
  FormItemLayout,
  FormItemGetData,
  FormItemSubmit,
  FormItemInitializer
} from '.';

export interface IFormItem extends IBaseFormItem {
  label: string | (() => string);
  required?: boolean;
  propertyPath?: string;
  hint?: string;
  description?: string;
  converter?: FormItemConverter;
  layout?: FormItemLayout;
  getData?: FormItemGetData;
  errorChecking?: FormItemError;
  control?: FormItemControl;
  submit?: FormItemSubmit;
  initializer?: FormItemInitializer;
}
