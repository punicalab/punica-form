import { IPropertyDecorator } from '@punica/common';
import { defineFormItem, IFormItem } from '@punica/form';

const FormItemB: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  'form-item-b',
  {
    create: (data: IFormItem): any => {
      return data;
    }
  }
);

export default FormItemB;
