import { LIMITS } from './limits';

const text = { type: 'string', maxLength: LIMITS.text } as const;
const name = { type: 'string', minLength: 1, maxLength: LIMITS.name } as const;

/**
 * The JSON Schema (draft 2020-12) of a form definition. Give it to a model
 * as the schema of its output; check what comes back with
 * `validateDefinition`, which also checks what a schema cannot express.
 */
export const formDefinitionSchema = {
  $schema: 'https://json-schema.org/draft/2020-12/schema',
  $id: 'https://form.punicalab.com/schema/form-definition-1.json',
  title: 'Punica Form definition',
  type: 'object',
  additionalProperties: false,
  required: ['version', 'items'],
  properties: {
    version: { const: 1 },
    name: text,
    title: text,
    description: text,
    columns: { enum: [1, 2, 3, 4] },
    items: {
      type: 'array',
      maxItems: LIMITS.items,
      items: { $ref: '#/$defs/item' }
    }
  },
  $defs: {
    item: {
      type: 'object',
      additionalProperties: false,
      required: ['property', 'type', 'label'],
      properties: {
        property: name,
        type: name,
        label: text,
        value: {},
        help: text,
        placeholder: text,
        disabled: { type: 'boolean' },
        hidden: { type: 'boolean' },
        options: {
          type: 'array',
          maxItems: LIMITS.options,
          items: {
            anyOf: [
              text,
              {
                type: 'object',
                additionalProperties: false,
                required: ['value', 'label'],
                properties: { value: text, label: text }
              }
            ]
          }
        },
        rules: {
          type: 'array',
          maxItems: LIMITS.rules,
          items: { $ref: '#/$defs/rule' }
        },
        visibleWhen: { $ref: '#/$defs/condition' },
        disabledWhen: { $ref: '#/$defs/condition' },
        props: { type: 'object' }
      }
    },
    rule: {
      type: 'object',
      additionalProperties: false,
      required: ['rule'],
      properties: { rule: name, value: {}, message: text }
    },
    condition: {
      anyOf: [
        {
          type: 'object',
          additionalProperties: false,
          required: ['property', 'equals'],
          properties: { property: name, equals: {} }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['property', 'notEquals'],
          properties: { property: name, notEquals: {} }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['property', 'in'],
          properties: { property: name, in: { type: 'array' } }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['all'],
          properties: {
            all: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/$defs/condition' }
            }
          }
        },
        {
          type: 'object',
          additionalProperties: false,
          required: ['any'],
          properties: {
            any: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/$defs/condition' }
            }
          }
        }
      ]
    }
  }
} as const;
