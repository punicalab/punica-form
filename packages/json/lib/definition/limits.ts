/** How large a form definition may be. It may come from an untrusted source. */
export const LIMITS = {
  /** Items of a form. */
  items: 200,

  /** Choices of an item. */
  options: 500,

  /** Rules of an item. */
  rules: 20,

  /** Characters of a property, a type or a rule name. */
  name: 100,

  /** Characters of a text. */
  text: 2000,

  /** Characters of the expression of a `pattern` rule. */
  pattern: 500,

  /** How deep conditions and values may be nested. */
  depth: 6
} as const;

/** The names of the rules that are built in. */
export const BUILT_IN_RULES = [
  'required',
  'email',
  'integer',
  'min',
  'max',
  'minLength',
  'maxLength',
  'pattern'
] as const;

/**
 * What a form item is made of. `props` of a definition cannot hold these:
 * they belong to the engine, and some of them (`path`, `validation`) decide
 * where values are written and what runs.
 */
export const RESERVED_PROPS = [
  'property',
  'path',
  'label',
  'type',
  'value',
  'required',
  'disabled',
  'hidden',
  'dirty',
  'touched',
  'validating',
  'validateDebounce',
  'error',
  'errorMessages',
  'initialize',
  'control',
  'validation',
  'help',
  'placeholder',
  'options'
] as const;

/**
 * Whether a regular expression repeats a group that itself repeats, such as
 * `(a+)+`: the shape that can take forever on a value that does not match.
 * It is a coarse check, not a proof that an expression is fast.
 */
export const isSlowPattern = (pattern: string): boolean => {
  return /\([^()]*[+*}][^()]*\)\s*[+*{]/.test(pattern);
};
