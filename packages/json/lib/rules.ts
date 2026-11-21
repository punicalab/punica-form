import { JsonValue, LIMITS } from './definition';

/** What a rule knows about the item it checks. */
export type RuleContext = {
  /** The `value` of the rule in the definition. */
  value?: JsonValue;

  /** The label of the item. */
  label: string;
};

/**
 * A validation rule: returns the message for a value that breaks it and
 * `undefined` for one that does not. It may ask a server.
 */
export type Rule = (
  value: unknown,
  context: RuleContext
) => string | undefined | Promise<string | undefined>;

export const isEmpty = (value: unknown): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  );
};

/** A rule for values of one type; other values are not its business. */
const forText =
  (check: (value: string, context: RuleContext) => string | undefined): Rule =>
  (value, context) =>
    typeof value === 'string' ? check(value, context) : undefined;

const forNumber =
  (
    check: (value: number, limit: number, label: string) => string | undefined
  ): Rule =>
  (value, { value: limit, label }) =>
    typeof value === 'number'
      ? check(value, limit as number, label)
      : undefined;

/**
 * The rules every form definition can use. Except for `required`, a rule is
 * not asked about an empty value.
 */
export const builtInRules: Record<string, Rule> = {
  required: (value, { label }) =>
    isEmpty(value) ? `${label} is required` : undefined,

  email: forText((value, { label }) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? undefined
      : `${label} must be an email address`
  ),

  minLength: forText((value, { value: length, label }) =>
    value.length < (length as number)
      ? `${label} must be at least ${String(length)} characters`
      : undefined
  ),

  maxLength: forText((value, { value: length, label }) =>
    value.length > (length as number)
      ? `${label} must be at most ${String(length)} characters`
      : undefined
  ),

  integer: (value, { label }) =>
    typeof value === 'number' && !Number.isInteger(value)
      ? `${label} must be a whole number`
      : undefined,

  // A value longer than any text of a form is not matched at all: the time
  // an expression takes grows with the value
  pattern: forText((value, { value: pattern, label }) =>
    value.length <= LIMITS.text && new RegExp(pattern as string).test(value)
      ? undefined
      : `${label} is not valid`
  ),

  min: forNumber((value, limit, label) =>
    value < limit ? `${label} must be at least ${limit}` : undefined
  ),

  max: forNumber((value, limit, label) =>
    value > limit ? `${label} must be at most ${limit}` : undefined
  )
};
