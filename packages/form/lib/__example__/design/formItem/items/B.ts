import { defineFormItem } from '../../../..';
import { BaseFormItem } from '../base';

const FormItemB = defineFormItem<BaseFormItem>(
  'form-item-b',
  (data: BaseFormItem): any => {
    return data;
  }
);

export default FormItemB;
