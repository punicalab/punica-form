/**
 * Creates a deep copy of the given value.
 * Functions are kept by reference, prototypes are preserved and
 * circular references are supported.
 * @param value - The value to copy
 * @returns The copied value
 */
export const deepCopy = <T>(value: T, seen = new WeakMap<object, any>()): T => {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (seen.has(value)) {
    return seen.get(value);
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (value instanceof Map) {
    const copy = new Map();

    seen.set(value, copy);
    value.forEach((v, k) => copy.set(deepCopy(k, seen), deepCopy(v, seen)));

    return copy as T;
  }

  if (value instanceof Set) {
    const copy = new Set();

    seen.set(value, copy);
    value.forEach((v) => copy.add(deepCopy(v, seen)));

    return copy as T;
  }

  const copy: any = Array.isArray(value)
    ? []
    : Object.create(Object.getPrototypeOf(value));

  seen.set(value, copy);

  for (const key of Object.keys(value)) {
    copy[key] = deepCopy((value as any)[key], seen);
  }

  return copy;
};
