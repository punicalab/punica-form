import { setFormProperty } from '../metadata';
import { FormClassDecorator } from './decorator';

/**
 * Defines a class decorator that stores data on a form class. Read it back
 * in a reader with `getFormProperty(entity, key)`.
 * @param key - Identifies the data
 */
const defineFormProperty = <T>(
  key: string
): ((data: T) => FormClassDecorator) => {
  return (data) => (target) => setFormProperty(target, key, data);
};

export default defineFormProperty;
