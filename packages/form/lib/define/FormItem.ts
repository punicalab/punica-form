import { IPropertyDecorator } from '@punica/common';
import { FormItemRegister } from '..';

/**
 *
 * @param type
 * @param renderer
 * @returns
 */
const defineFormItem = <T>(
  type: string,
  renderer: (props: T) => any
): IPropertyDecorator<T> => {
  FormItemRegister.getInstance().register(type, renderer);

  return (data: T) => {
    return (target: any, propertyKey: string) => {
      const allMetadata = Reflect.getMetadata(type, target) || {};

      allMetadata[propertyKey] = allMetadata[propertyKey] || {};
      allMetadata[propertyKey]['type'] = type;

      for (const key of Reflect.ownKeys(data as object)) {
        allMetadata[propertyKey][key] = data[key as keyof typeof data];
      }

      Reflect.defineMetadata(type, allMetadata, target);
    };
  };
};

export default defineFormItem;
