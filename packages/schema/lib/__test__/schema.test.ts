import {
  Form,
  FormController,
  FormItem,
  Services,
  defineForm,
  defineFormItem,
  field
} from '@punica/form';
import {
  FieldArray,
  GetValues,
  Reset,
  SetValue,
  Submit,
  Trigger,
  Validate
} from '@punica/form-service';
import * as v from 'valibot';
import * as yup from 'yup';
import { z } from 'zod';
import { Schema, SchemaValidation, StandardSchema, schema } from '..';

const Text = defineFormItem<Partial<FormItem<never>>>(
  'schema:text',
  () => null
);

const services = [
  SchemaValidation,
  GetValues,
  SetValue,
  Validate,
  Trigger,
  Reset,
  Submit
];

/** The same rules in every library. */
const libraries: Array<[string, StandardSchema]> = [
  [
    'Zod',
    z.object({
      email: z.email('Enter an email'),
      age: z.number('Enter a number').min(18, 'Adults only')
    })
  ],
  [
    'Valibot',
    v.object({
      email: v.pipe(v.string(), v.email('Enter an email')),
      age: v.pipe(v.number('Enter a number'), v.minValue(18, 'Adults only'))
    })
  ],
  [
    'Yup',
    yup.object({
      email: yup.string().email('Enter an email').required(),
      age: yup.number().min(18, 'Adults only').required()
    })
  ]
];

describe.each(libraries)('a form with a schema of %s', (_name, standard) => {
  const UserForm = defineForm(
    {
      email: field('', Text({ label: 'Email' })),
      age: field<number | undefined>(undefined, Text({ label: 'Age' }))
    },
    Schema(standard),
    Services(services)
  );

  let controller: FormController<InstanceType<typeof UserForm>>;

  const item = (index: number) => controller.getForm().items[index];

  beforeEach(async () => {
    controller = await FormController.fromEntity(new UserForm());
    await controller.start();
  });

  test('shows the issues of the schema on the items they are about', async () => {
    await controller.getService(SetValue).run('email', 'jane');
    await controller.getService(SetValue).run('age', 7);

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(item(0).error).toBe(true);
    expect(item(0).errorMessages).toHaveLength(1);
    expect(item(1).error).toBe(true);
    expect(item(1).errorMessages).toHaveLength(1);
    expect(controller.getForm().state).toMatchObject({
      valid: false,
      errors: []
    });
  });

  test('validates one item without touching the others', async () => {
    await controller.getService(SetValue).run('email', 'jane@example.com');
    await controller.getService(Trigger).run('email');

    expect(item(0).error).toBe(false);
    // Not valid either, but nobody asked
    expect(item(1).error).toBeFalsy();
  });

  test('a valid form is submitted', async () => {
    const handler = jest.fn();

    expect(await controller.getService(Submit).run(handler)).toBe(false);

    await controller.getService(SetValue).run('email', 'jane@example.com');
    await controller.getService(SetValue).run('age', 30);

    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(handler).toHaveBeenCalledWith({
      email: 'jane@example.com',
      age: 30
    });
    expect(controller.getForm().state?.valid).toBe(true);
  });
});

describe('SchemaValidation', () => {
  type Trip = {
    name: string;
    from: number;
    to: number;
    city: string;
    zip: string;
    contact: { phone: string };
  };

  const base = z.object({
    name: z.string().min(1, 'Name is required'),
    from: z.number(),
    to: z.number(),
    address: z.object({
      city: z.string().min(1, 'City is required'),
      zip: z.string().min(4, 'Zip is too short')
    }),
    contact: z.object({ phone: z.string().min(3, 'Phone is too short') })
  });

  // No item of the form holds what it asks for besides
  const standard = base.extend({ agreed: z.literal(true, 'Agree first') });

  const calls = jest.fn();
  const counted: StandardSchema = {
    '~standard': {
      version: 1,
      vendor: 'test',
      validate: (value) => {
        calls();

        return standard['~standard'].validate(value);
      }
    }
  };

  const createForm = (
    items: Array<Partial<FormItem<Trip>>> = []
  ): Form<Trip> => ({
    items: [
      { property: 'name', label: 'Name', value: 'Rome' },
      { property: 'from', label: 'From', value: 1 },
      { property: 'to', label: 'To', value: 2 },
      { property: 'city', label: 'City', path: 'address/city', value: 'Rome' },
      { property: 'zip', label: 'Zip', path: 'address/zip', value: '00100' },
      { property: 'contact', label: 'Contact', value: { phone: '12345' } }
    ].map((item, index) => ({ ...item, ...items[index] }) as FormItem<Trip>),
    services: [SchemaValidation.of(counted), ...services.slice(1)]
  });

  let controller: FormController<Trip>;

  const start = async (items?: Array<Partial<FormItem<Trip>>>) => {
    controller = await FormController.fromForm(createForm(items));
    await controller.start();
    calls.mockClear();
  };

  const messages = () =>
    controller.getForm().items.map((item) => item.errorMessages ?? []);

  test('issues that belong to no item are errors of the form', async () => {
    await start();
    await controller.getService(SetValue).run('to', 0);

    const handler = jest.fn();

    expect(await controller.getService(Submit).run(handler)).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(messages()).toEqual([[], [], [], [], [], []]);
    expect(controller.getForm().state?.errors).toEqual(['agreed: Agree first']);

    // A rule about two values has no path
    const agreed = SchemaValidation.of(
      base.refine(
        ({ from, to }) => from <= to,
        'The trip ends before it starts'
      )
    );

    controller = await FormController.fromForm({
      ...createForm(),
      services: [agreed, ...services.slice(1)]
    });
    await controller.start();
    await controller.getService(SetValue).run('to', 0);

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(controller.getForm().state?.errors).toEqual([
      'The trip ends before it starts'
    ]);

    await controller.getService(SetValue).run('to', 5);

    expect(await controller.getService(Validate).run()).toBe(true);
    expect(controller.getForm().state?.errors).toEqual([]);
    expect(await controller.getService(Submit).run(handler)).toBe(true);
  });

  test('an issue belongs to the item whose value holds its path', async () => {
    await start();
    await controller.getService(SetValue).run('city', '');
    await controller.getService(SetValue).run('zip', '1');
    await controller.getService(SetValue).run('contact', { phone: '1' });
    await controller.getService(Validate).run();

    expect(messages()).toEqual([
      [],
      [],
      [],
      ['City is required'],
      ['Zip is too short'],
      // The item that holds the object the issue is about
      ['Phone is too short']
    ]);
  });

  test('a form that is validated as a whole asks the schema once', async () => {
    await start();
    await controller.getService(Validate).run();

    expect(calls).toHaveBeenCalledTimes(1);

    // And again for the values it holds later
    await new Promise((resolve) => setTimeout(resolve));
    await controller.getService(SetValue).run('name', '');
    await controller.getService(Trigger).run('name');

    expect(calls).toHaveBeenCalledTimes(2);
    expect(messages()[0]).toEqual(['Name is required']);
  });

  test('the validation of an item runs first; the schema is asked about an item that passed', async () => {
    await start([
      {
        validation: async ({ formItem }) => ({
          error: formItem.value === 'Paris',
          errorMessages: ['Not Paris']
        })
      }
    ]);

    await controller.getService(SetValue).run('name', 'Paris');
    await controller.getService(Trigger).run('name');

    expect(messages()[0]).toEqual(['Not Paris']);

    await controller.getService(SetValue).run('name', '');
    await controller.getService(Trigger).run('name');

    expect(messages()[0]).toEqual(['Name is required']);
  });

  test('hidden and disabled items are not validated, and reset keeps the schema', async () => {
    await start([{ hidden: true }]);
    await controller.getService(SetValue).run('name', '');
    await controller.getService(Validate).run();

    expect(messages()[0]).toEqual([]);

    await start();
    await controller.getService(SetValue).run('name', '');
    await controller.getService(Validate).run();
    await controller.getService(Reset).run();

    expect(messages()[0]).toEqual([]);

    await controller.getService(SetValue).run('name', '');
    await controller.getService(Trigger).run('name');

    expect(messages()[0]).toEqual(['Name is required']);
  });

  test('a form without a schema is left alone, as the rows of a list are', async () => {
    const Line = defineForm(
      { product: field('', Text({ label: 'Product' })) },
      Schema(z.object({ product: z.string().min(1, 'Product is required') }))
    );
    const Plain = defineForm({ note: field('', Text({ label: 'Note' })) });

    type Order = {
      lines: Array<InstanceType<typeof Line>>;
      notes: Array<InstanceType<typeof Plain>>;
    };

    const order = await FormController.fromForm<Order>({
      items: [
        {
          property: 'lines',
          label: 'Lines',
          value: [{ product: '' }],
          row: () => new Line()
        },
        {
          property: 'notes',
          label: 'Notes',
          value: [{ note: '' }],
          row: () => new Plain()
        }
      ],
      // The rows get these services: the lines have a schema of their own
      services: [FieldArray, SchemaValidation, Validate, SetValue]
    });

    await order.start();

    const list = order.getService(FieldArray);
    const [line] = list.rows('lines');

    expect(await order.getService(Validate).run()).toBe(false);
    expect(line.controller.getForm().items[0].errorMessages).toEqual([
      'Product is required'
    ]);
    expect(list.rows('notes')[0].controller.getForm().items[0].validation).toBe(
      undefined
    );

    await line.controller.getService(SetValue).run('product', 'Paper');

    expect(await order.getService(Validate).run()).toBe(true);
  });
});

describe('a schema and the rest of a form', () => {
  const Line = defineForm({ product: field('', Text({ label: 'Product' })) });

  type Order = { title: string; lines: Array<InstanceType<typeof Line>> };

  const standard = z.object({
    title: z.string().min(1, 'Title is required'),
    lines: z.array(z.object({ product: z.string() })).min(2, 'Add two lines')
  });

  const createOrder = async (order: Array<new () => object>) => {
    const controller = await FormController.fromForm<Order>({
      items: [
        { property: 'title', label: 'Title', value: 'Order' },
        {
          property: 'lines',
          label: 'Lines',
          value: [{ product: 'Paper' }],
          row: () => new Line()
        }
      ],
      services: [...order, Validate, SetValue, Trigger] as never
    });

    await controller.start();

    return controller;
  };

  test.each([
    ['before', (schema: new () => object) => [schema, FieldArray]],
    ['after', (schema: new () => object) => [FieldArray, schema]]
  ])(
    'a schema given to the service is not the schema of the rows, listed %s FieldArray',
    async (_order, list) => {
      const controller = await createOrder(
        list(SchemaValidation.of(standard) as never)
      );
      const rows = () => controller.getService(FieldArray).rows('lines');
      const lines = () => controller.getForm().items[1];

      expect(await controller.getService(Validate).run()).toBe(false);
      expect(rows()[0].controller.getForm().state).toMatchObject({
        valid: true,
        errors: []
      });
      expect(lines()).toMatchObject({
        error: true,
        errorMessages: ['Add two lines']
      });

      // What the schema says about the list stays while a row changes
      await rows()[0].controller.getService(SetValue).run('product', 'Ink');
      await rows()[0].controller.getService(Trigger).run('product');

      expect(lines()).toMatchObject({
        error: true,
        errorMessages: ['Add two lines']
      });

      await controller.getService(FieldArray).append('lines');

      expect(await controller.getService(Validate).run()).toBe(true);
      expect(lines().error).toBe(false);
    }
  );

  test('a row with a problem of its own as a whole keeps its list in error', async () => {
    const Range = defineForm(
      {
        from: field(2, Text({ label: 'From' })),
        to: field(1, Text({ label: 'To' }))
      },
      Schema(
        z
          .object({ from: z.number(), to: z.number() })
          .refine(({ from, to }) => from <= to, 'Ends before it starts')
      )
    );

    type Plan = { ranges: Array<InstanceType<typeof Range>> };

    const controller = await FormController.fromForm<Plan>({
      items: [
        {
          property: 'ranges',
          label: 'Ranges',
          value: [{ from: 2, to: 1 }],
          row: () => new Range()
        }
      ],
      services: [FieldArray, SchemaValidation, Validate, SetValue, Trigger]
    });

    await controller.start();

    const [row] = controller.getService(FieldArray).rows('ranges');

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(row.controller.getForm().state).toMatchObject({
      valid: false,
      errors: ['Ends before it starts']
    });

    // Still not valid when the row is looked at again
    await row.controller.getService(Trigger).run('from');

    expect(controller.getForm().items[0].error).toBe(true);
    expect(controller.getForm().state?.valid).toBe(false);

    await row.controller.getService(SetValue).run('to', 5);

    expect(await controller.getService(Validate).run()).toBe(true);
    expect(controller.getForm().state?.valid).toBe(true);
  });

  test('the schema is asked about what the form is submitted as', async () => {
    const UserForm = defineForm(
      {
        // Not an item: no decorator
        id: field('u1'),
        email: field('jane@example.com', Text({ label: 'Email' }))
      },
      Schema(z.object({ id: z.string(), email: z.email() })),
      Services([SchemaValidation, GetValues, Validate, Submit])
    );
    const controller = await FormController.fromEntity(new UserForm());
    const handler = jest.fn();

    await controller.start();

    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(handler).toHaveBeenCalledWith({
      id: 'u1',
      email: 'jane@example.com'
    });
  });
});

describe('schema', () => {
  test('makes the validation of one item from a schema of its value', async () => {
    const UserForm = defineForm(
      {
        email: field(
          '',
          Text({
            label: 'Email',
            validation: schema(z.email('Enter an email').max(20, 'Too long'))
          })
        )
      },
      Services([SetValue, Trigger])
    );
    const controller = await FormController.fromEntity(new UserForm());

    await controller.start();
    await controller.getService(SetValue).run('email', 'x'.repeat(21));
    await controller.getService(Trigger).run('email');

    expect(controller.getForm().items[0]).toMatchObject({
      error: true,
      errorMessages: ['Enter an email', 'Too long']
    });

    await controller.getService(SetValue).run('email', 'jane@example.com');
    await controller.getService(Trigger).run('email');

    expect(controller.getForm().items[0]).toMatchObject({
      error: false,
      errorMessages: []
    });
  });

  test('works with a schema that validates asynchronously', async () => {
    const free = z.string().refine(async (value) => value !== 'taken', 'Taken');
    const validation = schema(free);

    expect(await validation({ formItem: { value: 'taken' } })).toEqual({
      error: true,
      errorMessages: ['Taken']
    });
    expect(await validation({ formItem: { value: 'free' } })).toEqual({
      error: false,
      errorMessages: []
    });
  });
});
