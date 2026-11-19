import { FormClassDecorator, IService, defineFormProperty } from '..';

/**
 * Constant for identifying form services decorator.
 */
export const DECORATOR_SERVICES = 'form-services';

/**
 * Decorator for adding services to a form class.
 */
export const Services = (
  data: Array<IService | (new () => IService)>
): FormClassDecorator => {
  return defineFormProperty<typeof data>(DECORATOR_SERVICES)(data);
};
