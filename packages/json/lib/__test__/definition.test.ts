import Ajv2020 from 'ajv/dist/2020';
import {
  FormDefinition,
  LIMITS,
  formDefinitionSchema,
  fromJsonSchema,
  validateDefinition
} from '../definition';

const valid: FormDefinition = {
  version: 1,
  name: 'signup',
  title: 'Sign up',
  columns: 2,
  items: [
    {
      property: 'email',
      type: 'text',
      label: 'Email',
      rules: [{ rule: 'required' }, { rule: 'email', message: 'Not an email' }]
    },
    { property: 'corporate', type: 'checkbox', label: 'Company', value: false },
    {
      property: 'company',
      type: 'text',
      label: 'Company name',
      visibleWhen: { property: 'corporate', equals: true },
      rules: [{ rule: 'minLength', value: 2 }]
    },
    {
      property: 'plan',
      type: 'select',
      label: 'Plan',
      options: ['free', { value: 'pro', label: 'Pro' }],
      disabledWhen: {
        any: [
          { property: 'corporate', notEquals: true },
          { all: [{ property: 'email', in: ['a@b.co'] }] }
        ]
      },
      props: { span: 'full' }
    }
  ]
};

const pathsOf = (input: unknown, options = {}) =>
  validateDefinition(input, options).map(({ path }) => path);

describe('validateDefinition', () => {
  test('accepts a valid definition', () => {
    expect(validateDefinition(valid)).toEqual([]);
  });

  test('reports what is wrong and where', () => {
    expect(validateDefinition('form')).toEqual([
      { path: '', message: 'must be an object' }
    ]);
    expect(pathsOf({ version: 2, items: {} })).toEqual(['version', 'items']);
    expect(
      pathsOf({
        version: 1,
        colums: 2,
        items: [
          { property: 'a', type: 'text' },
          { property: 'a', type: 'text', label: 'A', onChange: 'x' },
          'item'
        ]
      })
    ).toEqual([
      'colums',
      'items[1].property',
      'items[2].property',
      'items[0].label',
      'items[1].onChange',
      'items[2]'
    ]);
  });

  test('knows the types and the rules it is given', () => {
    const definition = {
      version: 1,
      items: [
        {
          property: 'a',
          type: 'slider',
          label: 'A',
          rules: [{ rule: 'unique' }, { rule: 'even' }]
        }
      ]
    };

    expect(pathsOf(definition, { types: ['text'] })).toEqual([
      'items[0].type',
      'items[0].rules[0].rule',
      'items[0].rules[1].rule'
    ]);
    expect(
      pathsOf(definition, { types: ['slider'], rules: ['unique', 'even'] })
    ).toEqual([]);
  });

  test('checks what the built-in rules compare with', () => {
    const rules = (...list: unknown[]) => ({
      version: 1,
      items: [{ property: 'a', type: 'text', label: 'A', rules: list }]
    });

    expect(
      pathsOf(
        rules(
          { rule: 'required', value: true },
          { rule: 'min', value: '3' },
          { rule: 'maxLength', value: 1.5 },
          { rule: 'pattern', value: '(' },
          { rule: 'pattern', value: 'a'.repeat(LIMITS.pattern + 1) },
          { rule: 'pattern' },
          { rule: 'min', value: 3, because: 'x' }
        )
      )
    ).toEqual([
      'items[0].rules[0].value',
      'items[0].rules[1].value',
      'items[0].rules[2].value',
      'items[0].rules[3].value',
      'items[0].rules[4].value',
      'items[0].rules[5].value',
      'items[0].rules[6].because'
    ]);
  });

  test('expressions that can freeze the page are refused', () => {
    const pattern = (value: string) =>
      pathsOf({
        version: 1,
        items: [
          {
            property: 'a',
            type: 'text',
            label: 'A',
            rules: [{ rule: 'pattern', value }]
          }
        ]
      });

    for (const slow of ['^(a+)+$', '(\\d*)*x', '([a-z]{1,9})+!', '(a|b+)* ']) {
      expect(pattern(slow)).toEqual(['items[0].rules[0].value']);
    }

    for (const fine of [
      '^[a-z]+$',
      '^\\+?[0-9 ]{7,}$',
      '^(ab|cd)+$',
      '^\\S+@\\S+$'
    ]) {
      expect(pattern(fine)).toEqual([]);
    }
  });

  test('conditions point to other items that exist', () => {
    const when = (visibleWhen: unknown) => ({
      version: 1,
      items: [
        { property: 'a', type: 'text', label: 'A', visibleWhen },
        { property: 'b', type: 'text', label: 'B' }
      ]
    });

    expect(pathsOf(when({ property: 'b', equals: 1 }))).toEqual([]);
    expect(pathsOf(when({ property: 'c', equals: 1 }))).toEqual([
      'items[0].visibleWhen.property'
    ]);
    expect(pathsOf(when({ property: 'a', equals: 1 }))).toEqual([
      'items[0].visibleWhen.property'
    ]);
    expect(pathsOf(when({ property: 'b' }))).toEqual(['items[0].visibleWhen']);
    expect(pathsOf(when({ property: 'b', in: 1 }))).toEqual([
      'items[0].visibleWhen.in'
    ]);
    expect(pathsOf(when({ all: [] }))).toEqual(['items[0].visibleWhen.all']);
    expect(pathsOf(when('b == 1'))).toEqual(['items[0].visibleWhen']);
  });

  test('a definition holds nothing but data, within limits', () => {
    const item = (extra: object) => ({
      version: 1,
      items: [{ property: 'a', type: 'text', label: 'A', ...extra }]
    });
    const deep = (levels: number): unknown =>
      levels ? [deep(levels - 1)] : 'x';

    expect(pathsOf(item({ value: () => 1 }))).toEqual(['items[0].value']);
    expect(pathsOf(item({ props: { onClick: () => 1 } }))).toEqual([
      'items[0].props.onClick'
    ]);
    expect(pathsOf(item({ props: new Date() }))).toEqual(['items[0].props']);
    expect(pathsOf(item({ value: NaN }))).toEqual(['items[0].value']);
    expect(pathsOf(item({ value: deep(LIMITS.depth + 1) }))).toHaveLength(1);
    expect(pathsOf(item({ label: 'x'.repeat(LIMITS.text + 1) }))).toEqual([
      'items[0].label'
    ]);
    expect(
      pathsOf(item({ props: JSON.parse('{"__proto__": {"admin": true}}') }))
    ).toEqual(['items[0].props.__proto__']);
    expect(
      pathsOf({
        version: 1,
        items: [{ property: '__proto__', type: 'text', label: 'A' }]
      })
    ).toEqual(['items[0].property']);
    expect(
      pathsOf({
        version: 1,
        items: Array.from({ length: LIMITS.items + 1 }, (_, index) => ({
          property: `p${index}`,
          type: 'text',
          label: 'P'
        }))
      })
    ).toEqual(['items']);
  });
});

describe('formDefinitionSchema', () => {
  const check = new Ajv2020().compile(formDefinitionSchema);

  test('accepts what validateDefinition accepts', () => {
    expect(check(valid)).toBe(true);
  });

  test('rejects definitions of the wrong shape', () => {
    for (const broken of [
      { version: 2, items: [] },
      { version: 1 },
      { version: 1, items: [{ property: 'a', type: 'text' }] },
      { version: 1, items: [], colums: 2 },
      {
        version: 1,
        items: [
          { property: 'a', type: 'text', label: 'A', visibleWhen: { all: [] } }
        ]
      }
    ]) {
      expect(check(broken)).toBe(false);
      expect(validateDefinition(broken)).not.toEqual([]);
    }
  });
});

describe('fromJsonSchema', () => {
  test('turns a flat object schema into a form definition', () => {
    const definition = fromJsonSchema({
      type: 'object',
      title: 'Contact',
      description: 'How can we reach you?',
      required: ['email'],
      properties: {
        email: { type: 'string', format: 'email', title: 'Email' },
        name: { type: 'string', minLength: 2, maxLength: 40, pattern: '^\\S' },
        age: {
          type: 'integer',
          minimum: 18,
          maximum: 99,
          description: 'In years',
          default: 30
        },
        news: { type: 'boolean', title: 'Send me news' },
        plan: {
          type: 'string',
          enum: ['free', 'pro'],
          enumNames: ['Free', 'Pro']
        },
        size: {
          oneOf: [{ const: 's', title: 'Small' }, { const: 'l' }]
        },
        site: { type: 'string', format: 'uri' }
      }
    });

    expect(definition).toEqual({
      version: 1,
      title: 'Contact',
      description: 'How can we reach you?',
      items: [
        {
          property: 'email',
          type: 'text',
          label: 'Email',
          rules: [{ rule: 'required' }, { rule: 'email' }],
          props: { inputType: 'email' }
        },
        {
          property: 'name',
          type: 'text',
          label: 'name',
          rules: [
            { rule: 'minLength', value: 2 },
            { rule: 'maxLength', value: 40 },
            { rule: 'pattern', value: '^\\S' }
          ]
        },
        {
          property: 'age',
          type: 'number',
          label: 'age',
          help: 'In years',
          value: 30,
          rules: [
            { rule: 'integer' },
            { rule: 'min', value: 18 },
            { rule: 'max', value: 99 }
          ]
        },
        {
          property: 'news',
          type: 'checkbox',
          label: 'Send me news',
          value: false
        },
        {
          property: 'plan',
          type: 'select',
          label: 'plan',
          options: [
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' }
          ]
        },
        {
          property: 'size',
          type: 'select',
          label: 'size',
          options: [{ value: 's', label: 'Small' }, 'l']
        },
        {
          property: 'site',
          type: 'text',
          label: 'site',
          props: { inputType: 'url' }
        }
      ]
    });
    expect(validateDefinition(definition)).toEqual([]);
  });

  test('a required boolean can be answered with no; integers are whole', () => {
    expect(
      fromJsonSchema({
        type: 'object',
        required: ['agree', 'count'],
        properties: {
          agree: { type: 'boolean' },
          count: { type: 'integer' }
        }
      }).items
    ).toEqual([
      { property: 'agree', type: 'checkbox', label: 'agree', value: false },
      {
        property: 'count',
        type: 'number',
        label: 'count',
        rules: [{ rule: 'required' }, { rule: 'integer' }]
      }
    ]);
  });

  test('refuses what it would convert wrongly', () => {
    const property = (schema: object) => () =>
      fromJsonSchema({ type: 'object', properties: { a: schema } });

    expect(property({ type: 'integer', enum: [1, 2] })).toThrow(
      'choices that are not strings'
    );
    expect(property({ oneOf: [{ type: 'string' }, { type: 'null' }] })).toThrow(
      'has the type undefined'
    );
    expect(property({ oneOf: [] })).toThrow('has the type undefined');
    expect(property({ type: 'number', multipleOf: 5 })).toThrow('multipleOf');
    expect(property({ type: 'constructor' })).toThrow('has the type');
    expect(
      property({ type: 'string', format: 'constructor' })().items[0].props
    ).toBeUndefined();
  });

  test('says what a form cannot show', () => {
    expect(() => fromJsonSchema({ type: 'string' })).toThrow('object schema');
    expect(() =>
      fromJsonSchema({
        type: 'object',
        properties: { tags: { type: 'array' } }
      })
    ).toThrow('"tags" has the type "array"');
    expect(() =>
      fromJsonSchema({ type: 'object', properties: { a: true } })
    ).toThrow('"a" must be a schema');
  });
});
