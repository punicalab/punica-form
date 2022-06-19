import { IClassDecorator, IAction } from '@punica/common';

export const DECORATOR_ACTIONS = 'class:form-actions';

export const Actions: IClassDecorator<Array<IAction>> = (
  actions: Array<IAction>
): ClassDecorator => {
  return (target) => {
    Reflect.defineMetadata(DECORATOR_ACTIONS, actions, target.prototype);

    return target;
  };
};
