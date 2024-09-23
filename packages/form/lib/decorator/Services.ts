import { IService, defineFormProperty } from '..';

/**
 * Constant for identifying form services decorator.
 */
export const DECORATOR_SERVICES = 'form-services';

/**
 * Decorator for adding services to a form class.
 */
export const Services = (data: Array<IService>): ClassDecorator => {
  return defineFormProperty<Array<IService>>(DECORATOR_SERVICES)(data);
};
