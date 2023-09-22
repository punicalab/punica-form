import { IClassDecorator } from '@punica/common';
import { IService, defineFormProperty } from '..';

/**
 *
 */
export const DECORATOR_SERVICES = 'form-services';

/**
 *
 */
export const Services: IClassDecorator<Array<IService<any, any>>> =
  defineFormProperty<Array<IService<any, any>>>(DECORATOR_SERVICES);
