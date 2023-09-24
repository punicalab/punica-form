import { IClassDecorator } from '@punica/common';
import { defineFormProperty } from '../..';

/**
 *
 */
export const DECORATOR_CUSTOM_TITLE = 'form-custom-title';

/**
 *
 */
export const CustomTitle: IClassDecorator<string> = defineFormProperty<string>(
  DECORATOR_CUSTOM_TITLE
);

/**
 *
 */
export const DECORATOR_CUSTOM_DESCRIPTION = 'form-custom-description';

/**
 *
 */
export const CustomDescription: IClassDecorator<string> =
  defineFormProperty<string>(DECORATOR_CUSTOM_DESCRIPTION);
