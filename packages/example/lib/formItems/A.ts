import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '@punica/form-register';
import { defineFormItem, IFormItem } from '@punica/form-model';

const DECORATOR_FORM_ITEM_A = 'property:form-item-a';

const FormItemA: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  DECORATOR_FORM_ITEM_A
);

FormItemRegister.getInstance().register(
  DECORATOR_FORM_ITEM_A,
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemA;
