import { IClassDecorator } from '@punica/common';
import { Initializer } from '..';
import { defineFormProperty } from '../define';

export const DECORATOR_INITIALIZER = 'form-initializer';

export const Initialize: IClassDecorator<Initializer> =
  defineFormProperty<Initializer>(DECORATOR_INITIALIZER);
