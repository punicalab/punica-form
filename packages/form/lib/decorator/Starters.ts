import { IClassDecorator } from '@punica/common';
import { IStarter, defineFormProperty } from '..';

/**
 * Constant for identifying form starters decorator.
 */
export const DECORATOR_STARTERS = 'form-starters';

/**
 * Decorator for adding starters to a form class.
 */
export const Starters: IClassDecorator<Array<IStarter<any, any>>> =
  defineFormProperty<Array<IStarter<any, any>>>(DECORATOR_STARTERS);
