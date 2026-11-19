/**
 * The metadata decorators attach to form classes. It is kept per class, so
 * no reflection polyfill is needed.
 */

/** Class → key → data of the class decorators. */
const formProperties = new WeakMap<object, Map<string, unknown>>();

/** Class → key → property → data of the property decorators. */
const formItemProperties = new WeakMap<
  object,
  Map<string, Record<string, unknown>>
>();

/** The class of an entity and its base classes, the base class first. */
const classesOf = (entity: object): object[] => {
  const classes: object[] = [];
  let current = Object.getPrototypeOf(entity);

  while (current && current !== Object.prototype) {
    classes.unshift(current.constructor);
    current = Object.getPrototypeOf(current);
  }

  return classes;
};

export const setFormProperty = (
  target: object,
  key: string,
  data: unknown
): void => {
  if (!formProperties.has(target)) {
    formProperties.set(target, new Map());
  }

  formProperties.get(target)?.set(key, data);
};

export const setFormItemProperty = (
  target: object,
  key: string,
  property: string,
  data: unknown
): void => {
  if (!formItemProperties.has(target)) {
    formItemProperties.set(target, new Map());
  }

  const properties = formItemProperties.get(target);

  properties?.set(key, { ...properties.get(key), [property]: data });
};

/**
 * Reads what a decorator created with `defineFormProperty` stored on the
 * class of the entity. A class overrides its base classes.
 * @param entity - An instance of the form class
 * @param key - The key the decorator was defined with
 */
export const getFormProperty = <T>(
  entity: object,
  key: string
): T | undefined => {
  return classesOf(entity).reduce<T | undefined>((found, target) => {
    const properties = formProperties.get(target);

    return properties?.has(key) ? (properties.get(key) as T) : found;
  }, undefined);
};

/**
 * Reads what a decorator created with `defineFormItemProperty` stored for
 * the properties of the entity, keyed by property name.
 * @param entity - An instance of the form class
 * @param key - The key the decorator was defined with
 */
export const getFormItemProperties = <T>(
  entity: object,
  key: string
): Record<string, T> => {
  return classesOf(entity).reduce<Record<string, T>>((found, target) => {
    return {
      ...found,
      ...(formItemProperties.get(target)?.get(key) as Record<string, T>)
    };
  }, {});
};
