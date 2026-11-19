/** The keys of a path such as `address/city` or `phones/0/number`. */
const keysOf = (path: string): string[] => path.split('/').filter(Boolean);

const isIndex = (key: string): boolean => /^\d+$/.test(key);

/**
 * Reads the value at a path inside an object.
 * @returns The value, or `undefined` when the path does not exist
 */
export const readPropertyPath = (entity: unknown, path: string): unknown => {
  let value = entity;

  for (const key of keysOf(path)) {
    if (!value || typeof value !== 'object' || !(key in value)) {
      return undefined;
    }

    value = (value as Record<string, unknown>)[key];
  }

  return value;
};

/**
 * Writes a value at a path inside an object, creating the objects and
 * arrays on the way that do not exist yet.
 */
export const writeToPropertyPath = (
  entity: object,
  path: string,
  value: unknown
): void => {
  const keys = keysOf(path);
  let current = entity as Record<string, unknown>;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      current[key] ??= isIndex(keys[index + 1]) ? [] : {};
      current = current[key] as Record<string, unknown>;
    }
  });
};
