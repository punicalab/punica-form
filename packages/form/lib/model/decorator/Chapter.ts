import { IPropertyDecorator } from '@punica/common';
import { IFormChapter } from '..';

export const DECORATOR_CHAPTER = 'property:form-chapter';

/**
 *
 * @param data
 */
export const Chapter: IPropertyDecorator<IFormChapter> = (
  data: IFormChapter
) => {
  return (target: any, propertyKey: string) => {
    const allMetadata = Reflect.getMetadata(DECORATOR_CHAPTER, target) || {};

    allMetadata[propertyKey] = allMetadata[propertyKey] || {};

    for (const key of Reflect.ownKeys(data)) {
      allMetadata[propertyKey][key] = data[key.toString()];
    }

    Reflect.defineMetadata(DECORATOR_CHAPTER, allMetadata, target);
  };
};
