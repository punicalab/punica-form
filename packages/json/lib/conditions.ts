import { isEqual } from '@punica/form';
import { Condition } from './definition';

/** The properties whose values a condition reads. */
export const propertiesOf = (condition: Condition): string[] => {
  if ('all' in condition) return condition.all.flatMap(propertiesOf);
  if ('any' in condition) return condition.any.flatMap(propertiesOf);

  return [condition.property];
};

/**
 * Whether a condition holds.
 * @param valueOf - The current value of a property
 */
export const holds = (
  condition: Condition,
  valueOf: (property: string) => unknown
): boolean => {
  if ('all' in condition) {
    return condition.all.every((member) => holds(member, valueOf));
  }

  if ('any' in condition) {
    return condition.any.some((member) => holds(member, valueOf));
  }

  // JSON has no undefined: a value that is not set compares as null
  const value = valueOf(condition.property) ?? null;

  if ('equals' in condition) return isEqual(value, condition.equals);
  if ('notEquals' in condition) return !isEqual(value, condition.notEquals);

  return condition.in.some((member) => isEqual(value, member));
};
