import { defineFormItem, FormItem } from '@punica/form';

const FormItemB = defineFormItem<FormItem<any>>(
  'form-item-b',
  (data: FormItem<any>): any => {
    return data;
  }
);

export default FormItemB;
