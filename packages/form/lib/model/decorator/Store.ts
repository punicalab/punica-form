import { IClassDecorator } from '@punica/common';

export const DECORATOR_STORE = 'class:form-store';

export const Store: IClassDecorator<Map<string, any>> = (
  store: Map<string, any>
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(DECORATOR_STORE, store, target.prototype);

    return target;
  };
};
