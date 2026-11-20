import { createFormItemRegister } from '@punica/form';
import {
  GetValues,
  SetValue,
  Submit,
  Trigger,
  Validate
} from '@punica/form-service';
import { FormDefinition, FormDefinitionError, fromSchema } from '..';

const types = { text: 'app:text', checkbox: 'app:checkbox' };

const definition: FormDefinition = {
  version: 1,
  name: 'signup',
  title: 'Sign up',
  items: [
    {
      property: 'email',
      type: 'text',
      label: 'Email',
      value: '',
      help: 'We never share it',
      rules: [
        { rule: 'required' },
        { rule: 'email', message: 'Not an email' },
        { rule: 'free' }
      ],
      props: { span: 'full' }
    },
    { property: 'corporate', type: 'checkbox', label: 'Company', value: false },
    {
      property: 'company',
      type: 'text',
      label: 'Company name',
      visibleWhen: { property: 'corporate', equals: true },
      rules: [{ rule: 'required' }, { rule: 'minLength', value: 2 }]
    },
    {
      property: 'vat',
      type: 'text',
      label: 'VAT number',
      disabledWhen: {
        any: [
          { property: 'corporate', notEquals: true },
          { property: 'company', in: ['', null] }
        ]
      }
    }
  ]
};

const start = async (input: unknown = definition) => {
  const controller = await fromSchema(input, {
    types,
    rules: {
      // Stands in for a rule that asks a server
      free: async (value) =>
        value === 'taken@example.com' ? 'That email is taken' : undefined
    }
  });

  await controller.start();

  const item = (property: string) =>
    controller.getForm().items.find((i) => i.property === property);
  const set = (property: string, value: unknown) =>
    controller.getService(SetValue).run(property, value);
  const errorOf = async (property: string) => {
    await controller.getService(Trigger).run(property);

    return item(property)?.errorMessages?.[0];
  };

  return { controller, item, set, errorOf };
};

describe('fromSchema', () => {
  test('creates a form from a definition', async () => {
    const { controller, item } = await start();

    expect(controller.getForm()).toMatchObject({
      title: 'Sign up',
      columns: 1
    });
    expect(item('email')).toMatchObject({
      property: 'email',
      type: 'app:text',
      label: 'Email',
      value: '',
      help: 'We never share it',
      required: true,
      span: 'full'
    });
    expect(await controller.getService(GetValues).run()).toEqual({
      email: '',
      corporate: false,
      company: undefined,
      vat: undefined
    });
  });

  test('rules are checked in their order; an empty value only by required', async () => {
    const { set, errorOf } = await start();

    expect(await errorOf('email')).toEqual('Email is required');

    await set('email', 'jane');
    expect(await errorOf('email')).toEqual('Not an email');

    await set('email', 'taken@example.com');
    expect(await errorOf('email')).toEqual('That email is taken');

    await set('email', 'jane@example.com');
    expect(await errorOf('email')).toBeUndefined();
  });

  test('the built-in rules', async () => {
    const { set, errorOf } = await start({
      version: 1,
      items: [
        {
          property: 'code',
          type: 'text',
          label: 'Code',
          rules: [
            { rule: 'minLength', value: 2 },
            { rule: 'maxLength', value: 4 },
            { rule: 'pattern', value: '^[a-z]+$' }
          ]
        },
        {
          property: 'age',
          type: 'text',
          label: 'Age',
          rules: [
            { rule: 'min', value: 18 },
            { rule: 'max', value: 99 }
          ]
        }
      ]
    });

    expect(await errorOf('code')).toBeUndefined();

    for (const [value, message] of [
      ['a', 'Code must be at least 2 characters'],
      ['abcde', 'Code must be at most 4 characters'],
      ['ab1', 'Code is not valid'],
      ['abc', undefined]
    ]) {
      await set('code', value);
      expect(await errorOf('code')).toEqual(message);
    }

    for (const [value, message] of [
      [17, 'Age must be at least 18'],
      [100, 'Age must be at most 99'],
      [30, undefined]
    ]) {
      await set('age', value);
      expect(await errorOf('age')).toEqual(message);
    }
  });

  test('conditions hide and disable items as the values change', async () => {
    const { controller, item, set } = await start();

    expect(item('company')?.hidden).toBe(true);
    expect(item('vat')?.disabled).toBe(true);

    // A hidden item is not validated: the form is valid without a company
    await set('email', 'jane@example.com');
    expect(await controller.getService(Validate).run()).toBe(true);

    await set('corporate', true);
    expect(item('company')?.hidden).toBe(false);
    expect(item('vat')?.disabled).toBe(true);
    expect(await controller.getService(Validate).run()).toBe(false);

    await set('company', 'Acme');
    expect(item('vat')?.disabled).toBe(false);

    await set('corporate', false);
    expect(item('company')?.hidden).toBe(true);
    expect(item('vat')?.disabled).toBe(true);
  });

  test('the values of a submitted form are a plain object', async () => {
    const { controller, set } = await start();
    const handler = jest.fn();

    await set('email', 'jane@example.com');

    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(handler).toHaveBeenCalledWith({
      email: 'jane@example.com',
      corporate: false,
      company: undefined,
      vat: undefined
    });
  });

  test('an item that is hidden goes back to the value it started with', async () => {
    const { controller, item, set } = await start();

    await set('email', 'jane@example.com');
    await set('corporate', true);
    await set('company', 'A');
    await controller.getService(Trigger).run('company');

    expect(item('company')?.error).toBe(true);

    await set('corporate', false);

    expect(item('company')).toMatchObject({
      hidden: true,
      value: undefined,
      error: false
    });
    expect(await controller.getService(GetValues).run()).toMatchObject({
      company: undefined
    });
  });

  test('props cannot set what makes an item', async () => {
    const refused = fromSchema(
      {
        version: 1,
        items: [
          {
            property: 'a',
            type: 'text',
            label: 'A',
            value: 'owned',
            props: { path: '__proto__/polluted', validation: 'x', span: 2 }
          }
        ]
      },
      { types }
    );

    await expect(refused).rejects.toMatchObject({
      problems: [
        { path: 'items[0].props.path' },
        { path: 'items[0].props.validation' }
      ]
    });
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  test('a rule message that is empty is refused; whole numbers and long values', async () => {
    await expect(
      fromSchema(
        {
          version: 1,
          items: [
            {
              property: 'a',
              type: 'text',
              label: 'A',
              rules: [{ rule: 'required', message: '' }]
            }
          ]
        },
        { types }
      )
    ).rejects.toMatchObject({
      problems: [{ path: 'items[0].rules[0].message' }]
    });

    const { set, errorOf } = await start({
      version: 1,
      items: [
        {
          property: 'count',
          type: 'text',
          label: 'Count',
          rules: [{ rule: 'integer' }]
        },
        {
          property: 'code',
          type: 'text',
          label: 'Code',
          rules: [{ rule: 'pattern', value: '^a+$' }]
        }
      ]
    });

    await set('count', 1.5);
    expect(await errorOf('count')).toEqual('Count must be a whole number');

    await set('count', 2);
    expect(await errorOf('count')).toBeUndefined();

    await set('code', 'a'.repeat(2001));
    expect(await errorOf('code')).toEqual('Code is not valid');
  });

  test('a definition that is not valid is refused, with its problems', async () => {
    const refused = fromSchema(
      {
        version: 1,
        items: [
          { property: 'a', type: 'slider', label: 'A' },
          { property: 'b', type: 'text', label: 'B', rules: [{ rule: 'nope' }] }
        ]
      },
      { types }
    );

    await expect(refused).rejects.toBeInstanceOf(FormDefinitionError);
    await expect(refused).rejects.toMatchObject({
      problems: [{ path: 'items[0].type' }, { path: 'items[1].rules[0].rule' }]
    });
    await expect(refused).rejects.toThrow('items[0].type "slider"');
  });

  test('without types a definition uses the types of the register', async () => {
    const register = createFormItemRegister();

    register.register('app:text', () => null);

    const item = { property: 'a', label: 'A' };
    const controller = await fromSchema(
      { version: 1, items: [{ ...item, type: 'app:text' }] },
      { register }
    );

    expect(controller.getForm().items[0].type).toEqual('app:text');
    await expect(
      fromSchema(
        { version: 1, items: [{ ...item, type: 'text' }] },
        { register }
      )
    ).rejects.toBeInstanceOf(FormDefinitionError);
  });
});
