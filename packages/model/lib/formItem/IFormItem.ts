import { IBaseFormItem } from './base';
import {
  FormItemConverter,
  DisabledChecking,
  ErrorChecking,
  HiddenChecking,
  Control,
  FormItemLayout,
  GetData,
  Submit,
  Startup
} from '.';

export interface IFormItem extends IBaseFormItem {
  label: string | (() => string);
  required?: boolean;
  propertyPath?: string;
  hint?: string;
  description?: string;
  converter?: FormItemConverter;
  layout?: FormItemLayout;
  getData?: GetData;
  errorChecking?: ErrorChecking;
  disabledChecking?: DisabledChecking;
  hiddenChecking?: HiddenChecking;
  control?: Control;
  submit?: Submit;
  startup?: Startup;
}
