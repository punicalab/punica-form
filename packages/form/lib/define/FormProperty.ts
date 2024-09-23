/**
 * Defines a form property with the specified type.
 * @param {string} type - Type of the form property.
 * @returns {ClassDecorator<T>} - Decorator function.
 */
const defineFormProperty = <T>(type: string): ((data: T) => ClassDecorator) => {
  return (data: T) => {
    return (target: Function): void => {
      Reflect.defineMetadata(type, data, target.prototype);
    };
  };
};

export default defineFormProperty;
