import { IClassDecorator } from '@punica/common';
import { Initializer } from '..';

export const DECORATOR_INITIALIZER = 'class:form-initializer';

export const Initialize: IClassDecorator<Initializer> = (
  initializer: Initializer
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(
      DECORATOR_INITIALIZER,
      initializer,
      target.prototype
    );

    return target;
  };
};
