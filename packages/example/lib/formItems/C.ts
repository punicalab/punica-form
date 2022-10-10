import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '@punica/form-register';
import { defineFormItem, IFormItem } from '@punica/form-model';

const DECORATOR_FORM_ITEM_C = 'property:form-item-c';

const FormItemC: IPropertyDecorator<IFormItem> = defineFormItem<IFormItem>(
  DECORATOR_FORM_ITEM_C
);

FormItemRegister.getInstance().register(
  DECORATOR_FORM_ITEM_C,
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemC;
