import {
  FormDefinition,
  ItemDefinition,
  JsonValue,
  OptionDefinition,
  RuleDefinition
} from './types';

type Schema = Record<string, unknown>;

const isObject = (value: unknown): value is Schema => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

/** How the formats of JSON Schema are entered. */
const INPUT_TYPES = new Map([
  ['email', 'email'],
  ['uri', 'url'],
  ['date', 'date']
]);

const ITEM_TYPES = new Map([
  ['string', 'text'],
  ['number', 'number'],
  ['integer', 'number'],
  ['boolean', 'checkbox']
]);

/** Keywords that limit a value in a way a form definition cannot. */
const UNSUPPORTED = ['multipleOf', 'exclusiveMinimum', 'exclusiveMaximum'];

/**
 * The choices of a property: `enum` (with `enumNames`), or `oneOf` of
 * constants. The values of choices are strings.
 */
const optionsOf = (
  property: string,
  schema: Schema
): OptionDefinition[] | undefined => {
  let choices: Array<{ value: unknown; label: unknown }> | undefined;

  if (Array.isArray(schema.enum)) {
    const names = Array.isArray(schema.enumNames) ? schema.enumNames : [];

    choices = schema.enum.map((value, index) => ({
      value,
      label: names[index]
    }));
  } else if (
    Array.isArray(schema.oneOf) &&
    schema.oneOf.length &&
    schema.oneOf.every((member) => isObject(member) && 'const' in member)
  ) {
    choices = (schema.oneOf as Schema[]).map(({ const: value, title }) => ({
      value,
      label: title
    }));
  }

  if (choices?.some(({ value }) => typeof value !== 'string')) {
    throw new Error(
      `The property "${property}" has choices that are not strings; a form offers strings to choose from`
    );
  }

  return choices?.map(({ value, label }) =>
    typeof label === 'string'
      ? { value: value as string, label }
      : (value as string)
  );
};

/**
 * Turns a JSON Schema into a form definition. It takes the flat schemas a
 * form can show: an object whose properties are strings, numbers, booleans
 * or choices, as the elicitation requests of the Model Context Protocol are.
 *
 * | JSON Schema | Form definition |
 * |---|---|
 * | `string` | `text`; `format` `email`, `uri` and `date` pick how it is entered |
 * | `number`, `integer` | `number` |
 * | `boolean` | `checkbox` |
 * | `enum`, `oneOf` of constants | `select` |
 * | `title`, `description`, `default` | `label`, `help`, `value` |
 * | `required`, `minLength`, `maxLength`, `pattern`, `minimum`, `maximum`, `format: email`, `integer` | rules |
 *
 * A required boolean is not a box that must be ticked: `false` is an answer,
 * so it only starts as `false`.
 *
 * Check the result with `validateDefinition` before it is used.
 * @throws When the schema is not an object schema, or a property has a type a form cannot show
 */
export const fromJsonSchema = (schema: unknown): FormDefinition => {
  if (!isObject(schema) || schema.type !== 'object') {
    throw new Error(
      'The schema must be an object schema: { "type": "object" }'
    );
  }

  const properties = isObject(schema.properties) ? schema.properties : {};
  const required = Array.isArray(schema.required) ? schema.required : [];

  const items = Object.entries(properties).map(([property, value]) => {
    if (!isObject(value)) {
      throw new Error(`The property "${property}" must be a schema`);
    }

    const options = optionsOf(property, value);
    const rules: RuleDefinition[] = [];
    const type = options ? 'select' : ITEM_TYPES.get(String(value.type));

    if (!type) {
      throw new Error(
        `The property "${property}" has the type ${JSON.stringify(value.type)}; a form shows string, number, integer, boolean and choices of strings`
      );
    }

    const unsupported = UNSUPPORTED.find((keyword) => keyword in value);

    if (unsupported) {
      throw new Error(
        `The property "${property}" uses ${unsupported}, which a form definition has no rule for`
      );
    }

    if (required.includes(property) && type !== 'checkbox') {
      rules.push({ rule: 'required' });
    }

    if (value.format === 'email') rules.push({ rule: 'email' });
    if (value.type === 'integer') rules.push({ rule: 'integer' });

    for (const [keyword, rule] of [
      ['minLength', 'minLength'],
      ['maxLength', 'maxLength'],
      ['pattern', 'pattern'],
      ['minimum', 'min'],
      ['maximum', 'max']
    ]) {
      if (value[keyword] !== undefined) {
        rules.push({ rule, value: value[keyword] as JsonValue });
      }
    }

    const inputType = INPUT_TYPES.get(String(value.format));
    const item: ItemDefinition = {
      property,
      type,
      label: typeof value.title === 'string' ? value.title : property
    };

    if (typeof value.description === 'string') item.help = value.description;
    if (value.default !== undefined) item.value = value.default as JsonValue;
    else if (type === 'checkbox') item.value = false;
    if (options) item.options = options;
    if (rules.length) item.rules = rules;
    if (type === 'text' && inputType) item.props = { inputType };

    return item;
  });

  const definition: FormDefinition = { version: 1, items };

  if (typeof schema.title === 'string') definition.title = schema.title;

  if (typeof schema.description === 'string') {
    definition.description = schema.description;
  }

  return definition;
};
