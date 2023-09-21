import { IClassDecorator } from '@punica/common';
import { defineFormProperty } from '..';

export const DECORATOR_STORE = 'form-store';

export const Store: IClassDecorator<Record<string, any>> =
  defineFormProperty<Record<string, any>>(DECORATOR_STORE);
