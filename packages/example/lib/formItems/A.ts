import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '@punica/form-register';
import { IFormItem } from '@punica/form-model';

const DECORATOR_FORM_ITEM_A = 'property:form-item-a';

/**
 *
 * @param data
 */
const FormItemA: IPropertyDecorator<IFormItem> = (data: IFormItem) => {
  return (target: any, propertyKey: string) => {
    const allMetadata =
      Reflect.getMetadata(DECORATOR_FORM_ITEM_A, target) || {};

    allMetadata[propertyKey] = allMetadata[propertyKey] || {};

    for (const key of Reflect.ownKeys(data)) {
      allMetadata[propertyKey][key] = data[key.toString()];
    }

    Reflect.defineMetadata(DECORATOR_FORM_ITEM_A, allMetadata, target);
  };
};

FormItemRegister.getInstance().register(
  DECORATOR_FORM_ITEM_A,
  (data: IFormItem): any => {
    return data;
  }
);

export default FormItemA;
