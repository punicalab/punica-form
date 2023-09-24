import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, FormItem } from '@punica/form';

const FormItemA: IPropertyDecorator<FormItem<any>> = defineFormItem(
  'form-item-a',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemA;
