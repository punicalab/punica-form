import { IPropertyDecorator } from '@punica/common';

/**
 * Defines a form item with the specified type and renderer.
 * @param {string} type - Type of the form item.
 * @returns {IPropertyDecorator<T>} - Decorator function.
 */
const defineFormItemProperty = <T>(type: string): IPropertyDecorator<T> => {
  return (data: T) => {
    return (target: any, propertyKey: string) => {
      const allMetadata = Reflect.getMetadata(type, target) || {};

      allMetadata[propertyKey] = allMetadata[propertyKey] || {};

      // Copy properties from data to metadata
      for (const key of Reflect.ownKeys(data as object)) {
        allMetadata[propertyKey][key] = data[key as keyof typeof data];
      }

      Reflect.defineMetadata(type, allMetadata, target);
    };
  };
};

export default defineFormItemProperty;
