import { IClassDecorator } from '@punica/common';
import { IService, defineFormProperty } from '..';

/**
 * Constant for identifying form services decorator.
 */
export const DECORATOR_SERVICES = 'form-services';

/**
 * Decorator for adding services to a form class.
 */
export const Services: IClassDecorator<Array<IService>> =
  defineFormProperty<Array<IService>>(DECORATOR_SERVICES);
