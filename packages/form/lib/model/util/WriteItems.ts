import { FormItem } from '..';

/**
 * Type alias for a function that writes form items to a storage.
 * @param E - The type of the entity
 * @param items - Array of form items to be written
 * @returns A Promise that resolves once the items are written
 */
export type WriteItems<E> = (items: Array<FormItem<E>>) => Promise<void>;
