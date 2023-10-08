import { defineFormItem, FormItem } from '@punica/form';

const FormItemC = defineFormItem<FormItem<any>>(
  'form-item-c',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemC;
