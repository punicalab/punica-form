import { defineFormProperty } from '@punica/form';

/**
 * Unique identifier for the form property decorator.
 */
const DECORATOR_DESCRIPTION = 'form:description';

/**
 * Decorator function for adding a description to a form item.
 * @param value - The description text to be associated with the form item.
 * @returns A decorator function.
 */
const Description = defineFormProperty<string>(DECORATOR_DESCRIPTION);

export { DECORATOR_DESCRIPTION, Description };
