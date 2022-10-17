import { IClassDecorator } from '@punica/common';

export const DECORATOR_TITLE = 'class:form-title';

export const Title: IClassDecorator<string | (() => string)> = (
  title: string | (() => string)
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(DECORATOR_TITLE, title, target.prototype);

    return target;
  };
};
