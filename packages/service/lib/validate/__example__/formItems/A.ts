import { defineFormItem, FormItem } from '@punica/form';

const FormItemA = defineFormItem<FormItem<any>>(
  'form-item-a',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemA;
