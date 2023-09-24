import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, FormItem } from '@punica/form';

const FormItemC: IPropertyDecorator<FormItem<any>> = defineFormItem(
  'form-item-c',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemC;
