import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, IFormItem } from '@punica/form';

const FormItemA: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  'form-item-a',
  {
    create: (data: IFormItem): any => {
      return data;
    }
  }
);

export default FormItemA;
