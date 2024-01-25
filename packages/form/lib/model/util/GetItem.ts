import { FormItem } from '..';

/**
 * Type alias for a function that retrieves a specific form item based on a property key.
 * @param E - The type of the entity
 * @param F - The type of the form item
 * @param property - The property key to retrieve the form item
 * @returns The form item corresponding to the property key
 */
export type GetItem<E, F extends FormItem<E>> = (property: keyof E) => F;
