import { IClassDecorator } from '@punica/common';

export const DECORATOR_DESCRIPTION = 'class:form-description';

export const Description: IClassDecorator<string | (() => string)> = (
  description: string | (() => string)
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      DECORATOR_DESCRIPTION,
      description,
      target.prototype
    );

    return target;
  };
};
