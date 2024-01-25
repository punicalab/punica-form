import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '..';

/**
 * Defines a form item with the specified type and renderer.
 * @param {string} type - Type of the form item.
 * @param {Function} renderer - Renderer function for the form item.
 * @returns {IPropertyDecorator<T>} - Decorator function.
 */
const defineFormItem = <T>(
  type: string,
  renderer: (props: T) => any
): IPropertyDecorator<T> => {
  // Register the form item type and renderer
  FormItemRegister.getInstance().register(type, renderer);

  return (data: T) => {
    return (target: any, propertyKey: string) => {
      const allMetadata = Reflect.getMetadata(type, target) || {};

      allMetadata[propertyKey] = allMetadata[propertyKey] || {};
      allMetadata[propertyKey]['type'] = type;

      // Copy properties from data to metadata
      for (const key of Reflect.ownKeys(data as object)) {
        allMetadata[propertyKey][key] = data[key as keyof typeof data];
      }

      Reflect.defineMetadata(type, allMetadata, target);
    };
  };
};

export default defineFormItem;
