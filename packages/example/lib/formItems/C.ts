import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, IFormItem } from '@punica/form';

const FormItemC: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  'form-item-c',
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemC;
