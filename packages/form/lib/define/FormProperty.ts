import { IClassDecorator } from '@punica/common';

/**
 * Defines a form property with the specified type.
 * @param {string} type - Type of the form property.
 * @returns {IClassDecorator<T>} - Decorator function.
 */
const defineFormProperty = <T>(type: string): IClassDecorator<T> => {
  return (data: T) => {
    return (target) => {
      Reflect.defineMetadata(type, data, target.prototype);

      return target;
    };
  };
};

export default defineFormProperty;
