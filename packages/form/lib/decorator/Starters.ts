import { FormItem, IStarter, defineFormProperty } from '..';

/**
 * Constant for identifying form starters decorator.
 */
export const DECORATOR_STARTERS = 'form-starters';

/**
 * Decorator for adding starters to a form class.
 */
export const Starters = <E, F extends FormItem<E>>(
  data: Array<IStarter<E, F>>
): ClassDecorator => {
  return defineFormProperty<Array<IStarter<E, F>>>(DECORATOR_STARTERS)(data);
};
