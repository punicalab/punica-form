import { IClassDecorator } from '@punica/common';
import { defineFormProperty, Initializer } from '..';

export const DECORATOR_INITIALIZER = 'form-initializer';

export const Initialize: IClassDecorator<Initializer> =
  defineFormProperty<Initializer>(DECORATOR_INITIALIZER);
