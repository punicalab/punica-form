import { defineFormItem } from '../../../..';
import { BaseFormItem } from '../base';

const FormItemC = defineFormItem<BaseFormItem>(
  'form-item-c',
  (data: BaseFormItem): any => {
    return data;
  }
);

export default FormItemC;
