import { IClassDecorator } from '@punica/common';
import { IService, defineFormProperty } from '..';

/**
 *
 */
export const DECORATOR_SERVICES = 'form-services';

/**
 *
 */
export const Services: IClassDecorator<Array<IService>> =
  defineFormProperty<Array<IService>>(DECORATOR_SERVICES);
