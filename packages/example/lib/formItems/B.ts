import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '@punica/form-register';
import { IFormItem } from '@punica/form-model';

const DECORATOR_FORM_ITEM_B = 'property:form-item-b';

/**
 *
 * @param data
 */
const FormItemB: IPropertyDecorator<IFormItem> = (data: IFormItem) => {
  return (target: any, propertyKey: string) => {
    const allMetadata =
      Reflect.getMetadata(DECORATOR_FORM_ITEM_B, target) || {};

    allMetadata[propertyKey] = allMetadata[propertyKey] || {};

    for (const key of Reflect.ownKeys(data)) {
      allMetadata[propertyKey][key] = data[key.toString()];
    }

    Reflect.defineMetadata(DECORATOR_FORM_ITEM_B, allMetadata, target);
  };
};

FormItemRegister.getInstance().register(
  DECORATOR_FORM_ITEM_B,
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemB;
