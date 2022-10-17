import { IOption, IOptionAttributeMapping } from '@punica/common';
import { IFormItem } from '.';

export interface IFormItemOptions extends IFormItem {
  options?: Array<IOption>;
  optionsMapper?: IOptionAttributeMapping;
}
