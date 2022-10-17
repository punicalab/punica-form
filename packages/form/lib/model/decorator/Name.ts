import { IClassDecorator } from '@punica/common';

export const DECORATOR_NAME = 'class:form-name';

export const Name: IClassDecorator<string> = (name: string): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(DECORATOR_NAME, name, target.prototype);

    return target;
  };
};
