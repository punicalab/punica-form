import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, FormItem } from '../..';

const FormItemB: IPropertyDecorator<FormItem<any>> = defineFormItem(
  'form-item-b',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemB;
