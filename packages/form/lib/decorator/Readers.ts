import { FormItem, IReader, defineFormProperty } from '..';

/**
 * Constant for identifying form readers decorator.
 */
export const DECORATOR_READERS = 'form-readers';

/**
 * Decorator for adding readers to a form class.
 */
export const Readers = <E, F extends FormItem<E>>(
  data: Array<IReader<E, F>>
): ClassDecorator => {
  return defineFormProperty<Array<IReader<E, F>>>(DECORATOR_READERS)(data);
};
