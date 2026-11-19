import { setFormItemProperty } from '../metadata';
import { FormPropertyDecorator, propertyDecorator } from './decorator';

/**
 * Defines a property decorator that stores data for a property of a form
 * class. Read it back in a reader with `getFormItemProperties(entity, key)`.
 * @param key - Identifies the data
 */
const defineFormItemProperty = <T>(
  key: string
): ((data: T) => FormPropertyDecorator) => {
  return (data) =>
    propertyDecorator((target, property) =>
      setFormItemProperty(target, key, property, data)
    );
};

export default defineFormItemProperty;
