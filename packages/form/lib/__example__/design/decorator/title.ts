import { IClassDecorator } from '@punica/common';
import { defineFormProperty } from '@punica/form';

/**
 * Unique identifier for the form property decorator.
 */
const DECORATOR_TITLE = 'form:title';

/**
 * Decorator function for adding a title to a form item.
 * @param value - The title text to be associated with the form item.
 * @returns A decorator function.
 */
const Title: IClassDecorator<string> =
  defineFormProperty<string>(DECORATOR_TITLE);

export { DECORATOR_TITLE, Title };
