import { defineFormItem } from '../../../..';
import { BaseFormItem } from '../base';

const FormItemA = defineFormItem<BaseFormItem>(
  'form-item-a',
  (data: BaseFormItem): any => {
    return data;
  }
);

export default FormItemA;
