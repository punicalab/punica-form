/** A value JSON can hold. */
export type JsonValue =
  string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/**
 * Whether something holds for the values of the form: a comparison of the
 * value of one item, or several conditions combined.
 */
export type Condition =
  | { property: string; equals: JsonValue }
  | { property: string; notEquals: JsonValue }
  | { property: string; in: JsonValue[] }
  | { all: Condition[] }
  | { any: Condition[] };

/** A validation rule of an item, by its name. */
export type RuleDefinition = {
  /** `required`, `email`, `integer`, `min`, `max`, `minLength`, `maxLength`, `pattern`, or a rule of the application. */
  rule: string;

  /** What the rule compares with: the limit of `min`, the expression of `pattern`, … */
  value?: JsonValue;

  /** The message in place of the default one. */
  message?: string;
};

/** A choice of an item: its value, or its value and the text to show. */
export type OptionDefinition = string | { value: string; label: string };

/** An item of a form definition. */
export type ItemDefinition = {
  /** The key of the value in the values of the form. */
  property: string;

  /** The kind of field, one of the types the application renders. */
  type: string;

  label: string;

  /** The value the form starts with. */
  value?: JsonValue;

  /** Text under the field. */
  help?: string;

  /** Shown while the field is empty. */
  placeholder?: string;

  disabled?: boolean;
  hidden?: boolean;

  /** The choices, for types that have them. */
  options?: OptionDefinition[];

  rules?: RuleDefinition[];

  /** The item is hidden unless this holds. */
  visibleWhen?: Condition;

  /** The item is disabled while this holds. */
  disabledWhen?: Condition;

  /** What the component of the type takes besides: `rows`, `span`, … */
  props?: { [key: string]: JsonValue };
};

/**
 * A form as data. It holds no code: rules and conditions are named and
 * declared, so a definition can come from an untrusted source such as a
 * language model.
 */
export type FormDefinition = {
  /** The version of this format. */
  version: 1;

  /** Identifies the form in developer tools. */
  name?: string;

  /** The heading of the form. */
  title?: string;

  /** Text under the heading. */
  description?: string;

  /** Columns the fields are laid out in. */
  columns?: 1 | 2 | 3 | 4;

  items: ItemDefinition[];
};

/** A problem of a form definition. */
export type DefinitionProblem = {
  /** Where it is, such as `items[2].rules[0].value`. */
  path: string;

  message: string;
};
