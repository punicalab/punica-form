import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '@punica/form-register';
import { defineFormItem, IFormItem } from '@punica/form-model';

const DECORATOR_FORM_ITEM_B = 'property:form-item-b';

const FormItemB: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  DECORATOR_FORM_ITEM_B
);

FormItemRegister.getInstance().register(
  DECORATOR_FORM_ITEM_B,
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemB;
