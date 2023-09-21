import { IClassDecorator } from '@punica/common';

/**
 *
 * @param type
 * @returns
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
