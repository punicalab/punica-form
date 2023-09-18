/**
 *
 * @param type
 * @returns
 */
const defineFormProperty = <T>(type: string) => {
  return (data: T): ClassDecorator => {
    return (target) => {
      Reflect.defineMetadata(type, data, target.prototype);

      return target;
    };
  };
};

export default defineFormProperty;
