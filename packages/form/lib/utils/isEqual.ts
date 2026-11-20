/**
 * Whether two values are deeply equal. Objects, arrays, dates, regular
 * expressions, maps and sets are compared by their content, circular
 * references included. Objects without own properties that are not plain,
 * such as a `File`, are only equal to themselves.
 */
export const isEqual = (
  a: unknown,
  b: unknown,
  seen = new WeakMap<object, WeakSet<object>>()
): boolean => {
  if (Object.is(a, b)) {
    return true;
  }

  if (
    typeof a !== 'object' ||
    typeof b !== 'object' ||
    a === null ||
    b === null ||
    Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)
  ) {
    return false;
  }

  // A pair that is being compared already is equal as far as it goes
  if (seen.get(a)?.has(b)) {
    return true;
  }

  seen.set(a, (seen.get(a) ?? new WeakSet()).add(b));

  if (a instanceof Date) {
    return a.getTime() === (b as Date).getTime();
  }

  if (a instanceof RegExp) {
    return String(a) === String(b);
  }

  if (a instanceof Set) {
    const other = [...(b as Set<unknown>)];

    return (
      a.size === other.length &&
      [...a].every(
        (value) =>
          (b as Set<unknown>).has(value) ||
          other.some((candidate) => isEqual(value, candidate, seen))
      )
    );
  }

  if (a instanceof Map) {
    const other = [...(b as Map<unknown, unknown>)];

    return (
      a.size === other.length &&
      [...a].every(([key, value]) =>
        other.some(
          ([otherKey, otherValue]) =>
            isEqual(key, otherKey, seen) && isEqual(value, otherValue, seen)
        )
      )
    );
  }

  const keys = Object.keys(a);
  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const prototype = Object.getPrototypeOf(a);

  if (
    keys.length === 0 &&
    prototype !== Object.prototype &&
    prototype !== Array.prototype &&
    prototype !== null
  ) {
    return false;
  }

  return (
    keys.length === Object.keys(right).length &&
    keys.every((key) => key in right && isEqual(left[key], right[key], seen))
  );
};
