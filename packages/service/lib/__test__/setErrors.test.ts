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
  ClearError,
  ClearErrors,
  FieldArray,
  GetValues,
  Reset,
  ResetItem,
  SetErrors,
  SetValue,
  Submit,
  Touch,
  Trigger,
  Validate
} from '..';

const Text = defineFormItem<Partial<FormItem<never>>>('test:text', () => null);

const Line = defineForm({
  name: field(
    '',
    Text({
      label: 'Name',
      validation: async ({ formItem }) => ({
        error: !formItem.value,
        errorMessages: formItem.value ? [] : ['is required']
      })
    })
  ),
  price: field(0, Text({ label: 'Price' }))
});

type LineValues = InstanceType<typeof Line>;
type Invoice = { customer: string; email: string; lines: LineValues[] };
type Item = FormItem<Invoice>;

const services = [
  FieldArray,
  GetValues,
  SetValue,
  Validate,
  Trigger,
  Reset,
  ResetItem,
  ClearError,
  ClearErrors,
  Touch,
  Submit,
  SetErrors
];

const start = async (given = services) => {
  const form: Form<Invoice, Item> = {
    items: [
      { property: 'customer', label: 'Customer', value: 'Jane' },
      {
        property: 'email',
        label: 'Email',
        value: 'jane@example.com',
        validation: async ({ formItem }) => ({
          error: !String(formItem.value).includes('@'),
          errorMessages: String(formItem.value).includes('@')
            ? []
            : ['is no email']
        })
      },
      {
        property: 'lines',
        label: 'Lines',
        value: [
          { name: 'Paper', price: 5 },
          { name: 'Ink', price: 20 }
        ],
        row: () => new Line()
      }
    ],
    services: given
  };
  const controller = await FormController.fromForm<Invoice, Item>(form);

  await controller.start();

  return controller;
};

type Controller = Awaited<ReturnType<typeof start>>;

const item = (controller: Controller, property: keyof Invoice) =>
  controller.getForm().items.find((one) => one.property === property) as Item;
const rowItem = (controller: Controller, index: number, property: string) => {
  const row = controller.getService(FieldArray).rows('lines')[index];

  return row.controller
    .getForm()
    .items.find((one) => one.property === property) as FormItem<LineValues>;
};

describe('SetErrors', () => {
  test('shows the messages on the items they name', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      email: ['This email is already registered', 'And too long'],
      customer: 'Unknown customer'
    });

    expect(rest).toEqual([]);
    expect(item(controller, 'email')).toMatchObject({
      error: true,
      errorMessages: ['This email is already registered', 'And too long']
    });
    expect(item(controller, 'customer')).toMatchObject({
      error: true,
      errorMessages: ['Unknown customer']
    });
    expect(controller.getForm().state?.valid).toBe(false);
  });

  test('gives back the messages that are about no item, in their order', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      capacity: ['Only 10 seats are left'],
      email: ['Taken'],
      'nothing.here': 'Closed'
    });

    expect(rest).toEqual(['Only 10 seats are left', 'Closed']);
    expect(item(controller, 'email').errorMessages).toEqual(['Taken']);
    expect(item(controller, 'customer').error).toBeFalsy();
  });

  test('reaches the items of the rows of a list, with dots or brackets', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      'lines.1.price': ['Too expensive'],
      'lines[0].name': ['Out of stock']
    });

    expect(rest).toEqual([]);
    expect(rowItem(controller, 1, 'price')).toMatchObject({
      error: true,
      errorMessages: ['Too expensive']
    });
    expect(rowItem(controller, 0, 'name').errorMessages).toEqual([
      'Out of stock'
    ]);
    expect(rowItem(controller, 0, 'price').error).toBeFalsy();
    // The list is in error when a row is
    expect(item(controller, 'lines').error).toBe(true);
    expect(controller.getForm().state?.valid).toBe(false);
  });

  test('shows a message about a row as a whole, or about the list, on the list', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      lines: ['Add at least three lines'],
      'lines.1': ['This line is a duplicate']
    });

    expect(rest).toEqual([]);
    expect(item(controller, 'lines')).toMatchObject({
      error: true,
      errorMessages: ['Add at least three lines', 'This line is a duplicate']
    });
  });

  test('gives back what names a row or an item that is not there', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      'lines.7.price': ['No such row'],
      'lines.0.colour': ['No such item'],
      'lines.first.price': ['No index'],
      'customer.0.name': ['Not a list']
    });

    // Those of a row stand where the row was first named
    expect(rest).toEqual([
      'No such row',
      'No such item',
      'No index',
      'Not a list'
    ]);
    expect(item(controller, 'lines').error).toBeFalsy();
    expect(item(controller, 'customer').error).toBeFalsy();
  });

  test('leaves out empty messages, and takes nothing for nothing', async () => {
    const controller = await start();
    const service = controller.getService(SetErrors);

    expect(await service.run({ email: [], customer: '' })).toEqual([]);
    expect(await service.run({})).toEqual([]);
    expect(await service.run(undefined as never)).toEqual([]);
    expect(item(controller, 'email').error).toBeFalsy();
    expect(item(controller, 'customer').error).toBeFalsy();
  });

  test('an error goes away when its item is validated again', async () => {
    const controller = await start();

    await controller.getService(SetErrors).run({ email: ['Taken'] });
    await controller.getService(SetValue).run('email', 'other@example.com');

    // Setting a value does not validate
    expect(item(controller, 'email').error).toBe(true);

    await controller.getService(Trigger).run('email');

    expect(item(controller, 'email')).toMatchObject({
      error: false,
      errorMessages: []
    });
  });

  test('an error goes away with ClearError, ClearErrors and Reset, in rows as well', async () => {
    const controller = await start();
    const set = () =>
      controller.getService(SetErrors).run({
        email: ['Taken'],
        'lines.1.price': ['Too expensive']
      });

    await set();
    await controller.getService(ClearError).run('email');
    expect(item(controller, 'email').error).toBe(false);
    expect(rowItem(controller, 1, 'price').error).toBe(true);

    await controller.getService(ClearErrors).run();
    expect(rowItem(controller, 1, 'price').error).toBe(false);
    expect(item(controller, 'lines').error).toBeFalsy();

    await set();
    await controller.getService(Reset).run();
    expect(item(controller, 'email').error).toBeFalsy();
    expect(rowItem(controller, 1, 'price').error).toBeFalsy();
  });

  test('a form submitted again is validated again, and sent when it is valid', async () => {
    const controller = await start();
    const sent: Invoice[] = [];
    const handler = async (values: Invoice) => {
      sent.push(values);

      if (sent.length === 1) {
        const rest = await controller
          .getService(SetErrors)
          .run({ email: ['Taken'], capacity: ['Full'] });

        throw new Error(rest.join(' '));
      }
    };

    expect(await controller.getService(Submit).run(handler)).toBe(false);
    expect(item(controller, 'email').errorMessages).toEqual(['Taken']);
    expect(controller.getForm().state?.errors).toEqual(['Full']);

    // The user corrects nothing the form can check: it is sent again
    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(sent).toHaveLength(2);
    expect(item(controller, 'email').error).toBe(false);
    expect(controller.getForm().state?.errors).toEqual([]);
  });

  test('subscribers are told once for the items of the form', async () => {
    const controller = await start();
    let told = 0;

    controller.subscribe(() => (told += 1));
    await controller
      .getService(SetErrors)
      .run({ email: ['Taken'], customer: ['Unknown'] });

    expect(told).toBe(1);
  });

  test('gives the rest back in the order it was given, rows included', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      a: ['1'],
      'lines.0.colour': ['2'],
      b: ['3'],
      'lines.1.size': ['4'],
      'lines.0.weight': ['5'],
      c: ['6']
    });

    // What a row gives back stands where the row was first named
    expect(rest).toEqual(['1', '2', '5', '3', '4', '6']);
  });

  test('two names for one item of a row add up', async () => {
    const controller = await start();

    await controller.getService(SetErrors).run({
      'lines.1.price': ['A'],
      'lines[1].price': ['B'],
      email: ['C'],
      ' email ': 'D'
    });

    expect(rowItem(controller, 1, 'price').errorMessages).toEqual(['A', 'B']);
    expect(item(controller, 'email').errorMessages).toEqual(['C', 'D']);
  });

  test('reads nested objects and lists, as some servers send them', async () => {
    const controller = await start();
    const rest = await controller.getService(SetErrors).run({
      email: ['Taken'],
      lines: [{}, { price: ['Too high'], name: 'Unknown product' }],
      detail: { code: ['Bad code'] }
    });

    expect(rest).toEqual(['Bad code']);
    expect(rowItem(controller, 1, 'price').errorMessages).toEqual(['Too high']);
    expect(rowItem(controller, 1, 'name').errorMessages).toEqual([
      'Unknown product'
    ]);
    expect(rowItem(controller, 0, 'price').error).toBeFalsy();
  });

  test.each([
    ['null', { email: null }],
    ['undefined', { email: undefined }],
    ['true', { email: true }],
    ['a list of nothing', { email: [null, undefined, false] }],
    ['null itself', null],
    ['undefined itself', undefined]
  ])('takes %s for no message, without throwing', async (_, errors) => {
    const controller = await start();

    expect(await controller.getService(SetErrors).run(errors)).toEqual([]);
    expect(item(controller, 'email').error).toBeFalsy();
  });

  test('a number is a message; a text or a list by itself names no item', async () => {
    const controller = await start();
    const service = controller.getService(SetErrors);

    expect(await service.run({ email: [404, 'Not found'] })).toEqual([]);
    expect(item(controller, 'email').errorMessages).toEqual([
      '404',
      'Not found'
    ]);
    expect(await service.run('Something went wrong')).toEqual([
      'Something went wrong'
    ]);
    expect(await service.run(['One', 'Two'])).toEqual(['One', 'Two']);
    // Names that look like properties of every object are no items
    expect(
      await service.run(JSON.parse('{"__proto__":["a"],"constructor":["b"]}'))
    ).toEqual(['a', 'b']);
  });

  test('replaces the messages its item had', async () => {
    const controller = await start();
    const service = controller.getService(SetErrors);

    await service.run({ email: ['First'] });
    await service.run({ email: ['Second'] });

    expect(item(controller, 'email').errorMessages).toEqual(['Second']);
  });

  describe('an item that is not validated', () => {
    test('loses the error when it is asked to be validated', async () => {
      const controller = await start();

      await controller.getService(SetErrors).run({ customer: ['Unknown'] });
      await controller.getService(Trigger).run('customer');

      expect(item(controller, 'customer')).toMatchObject({
        error: false,
        errorMessages: []
      });
      expect(controller.getForm().state?.valid).toBe(true);
    });

    test('does not keep a form that was submitted again from being valid', async () => {
      const controller = await start();
      const sent: Invoice[] = [];

      await controller.getService(SetErrors).run({ customer: ['Unknown'] });

      expect(await controller.getService(Validate).run()).toBe(true);
      expect(item(controller, 'customer').error).toBe(false);

      await controller.getService(SetErrors).run({ customer: ['Unknown'] });

      expect(
        await controller.getService(Submit).run(async (values) => {
          sent.push(values);
        })
      ).toBe(true);
      expect(sent).toHaveLength(1);
      expect(item(controller, 'customer').error).toBe(false);
      expect(controller.getForm().state?.valid).toBe(true);
    });

    test('in a row: the row and its list are valid again together', async () => {
      const controller = await start();

      await controller
        .getService(SetErrors)
        .run({ 'lines.1.price': ['Too high'] });

      expect(item(controller, 'lines').error).toBe(true);
      expect(await controller.getService(Validate).run()).toBe(true);
      expect(rowItem(controller, 1, 'price')).toMatchObject({
        error: false,
        errorMessages: []
      });
      expect(item(controller, 'lines').error).toBe(false);
      expect(controller.getForm().state?.valid).toBe(true);
    });
  });

  describe('a message on the list itself', () => {
    const set = (controller: Controller) =>
      controller
        .getService(SetErrors)
        .run({ lines: ['At least three'], 'lines.0': ['A duplicate'] });
    const row = (controller: Controller, index: number) =>
      controller.getService(FieldArray).rows('lines')[index].controller;

    test('stays while the rows change', async () => {
      const controller = await start();

      await set(controller);
      await row(controller, 0).getService(Touch).run('name');
      await row(controller, 1).getService(SetValue).run('price', 21);

      expect(item(controller, 'lines')).toMatchObject({
        error: true,
        errorMessages: ['At least three', 'A duplicate']
      });
      expect(controller.getForm().state?.valid).toBe(false);
    });

    test('is shown on a list that is in error already for a row', async () => {
      const controller = await start();

      await controller
        .getService(SetErrors)
        .run({ 'lines.0.name': ['Out of stock'] });
      await controller.getService(SetErrors).run({ lines: ['Too many'] });

      expect(item(controller, 'lines')).toMatchObject({
        error: true,
        errorMessages: ['Too many']
      });
    });

    test('stays when an error of a row is cleared in the row', async () => {
      const controller = await start();

      await controller
        .getService(SetErrors)
        .run({ lines: ['Too many'], 'lines.0.name': ['Out of stock'] });
      await row(controller, 0).getService(ClearError).run('name');

      expect(item(controller, 'lines')).toMatchObject({
        error: true,
        errorMessages: ['Too many']
      });
    });

    test('goes when the list is cleared, reset or validated again', async () => {
      for (const clear of [
        (controller: Controller) =>
          controller.getService(ClearError).run('lines'),
        (controller: Controller) =>
          controller.getService(ResetItem).run('lines'),
        (controller: Controller) => controller.getService(Validate).run()
      ]) {
        const controller = await start();

        await set(controller);
        await clear(controller);

        expect(item(controller, 'lines')).toMatchObject({
          error: false,
          errorMessages: []
        });
        expect(controller.getForm().state?.valid).toBe(true);
      }
    });
  });

  describe('a validation that is running when the error is set', () => {
    /** A form whose email is checked by something slow, which the test ends. */
    const slow = async (validateDebounce?: number) => {
      const asked: Array<(error: boolean) => void> = [];
      const controller = await FormController.fromForm<Invoice, Item>({
        items: [
          { property: 'customer', label: 'Customer', value: 'Jane' },
          {
            property: 'email',
            label: 'Email',
            value: 'jane@example.com',
            validateDebounce,
            validation: () =>
              new Promise((resolve) =>
                asked.push((error) =>
                  resolve({ error, errorMessages: error ? ['is taken'] : [] })
                )
              )
          },
          {
            property: 'lines',
            label: 'Lines',
            value: [],
            row: () => new Line()
          }
        ],
        services
      });

      await controller.start();

      return { controller, asked };
    };
    const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

    test('does not erase it with what it finds', async () => {
      const { controller, asked } = await slow();
      const triggered = controller.getService(Trigger).run('email');

      await tick();
      await controller.getService(SetErrors).run({ email: ['Server says no'] });
      asked[0](false);
      await triggered;

      expect(item(controller, 'email')).toMatchObject({
        error: true,
        errorMessages: ['Server says no']
      });
    });

    test('that waits for its delay does not run over it', async () => {
      const { controller, asked } = await slow(20);
      const triggered = controller.getService(Trigger).run('email');

      await controller.getService(SetErrors).run({ email: ['Server says no'] });
      await new Promise((resolve) => setTimeout(resolve, 40));
      await triggered;

      expect(asked).toHaveLength(0);
      expect(item(controller, 'email').errorMessages).toEqual([
        'Server says no'
      ]);
    });

    test('of the whole form does not erase it, and says the form is not valid', async () => {
      const { controller, asked } = await slow();
      const validated = controller.getService(Validate).run();

      await tick();
      await controller
        .getService(SetErrors)
        .run({ email: ['Server says no'], customer: ['Unknown'] });
      asked[0]?.(false);

      expect(await validated).toBe(false);
      expect(asked).toHaveLength(1);
      expect(item(controller, 'email').errorMessages).toEqual([
        'Server says no'
      ]);
      expect(item(controller, 'customer').errorMessages).toEqual(['Unknown']);
    });

    test('a validation started afterwards replaces it', async () => {
      const { controller, asked } = await slow();

      await controller.getService(SetErrors).run({ email: ['Server says no'] });

      const triggered = controller.getService(Trigger).run('email');

      await tick();
      asked[0](true);
      await triggered;

      expect(item(controller, 'email')).toMatchObject({
        error: true,
        errorMessages: ['is taken']
      });
    });
  });

  test('an error goes with ResetItem', async () => {
    const controller = await start();

    await controller.getService(SetErrors).run({ email: ['Taken'] });
    await controller.getService(ResetItem).run('email');

    expect(item(controller, 'email').error).toBeFalsy();
  });

  test('takes what an application has at hand, by its types', async () => {
    const controller = await start();
    const service = controller.getService(SetErrors);

    interface ApiErrors {
      email?: string[];
      capacity?: string[];
    }

    const typed: ApiErrors = { email: ['Taken'] };
    const loose: Record<string, string[] | undefined> = { email: undefined };
    const caught: unknown = { capacity: ['Full'] };

    expect(await service.run(typed)).toEqual([]);
    expect(await service.run(loose)).toEqual([]);
    expect(await service.run(caught)).toEqual(['Full']);
  });

  test('is not there for a form that does not list it', async () => {
    const controller = await start(
      services.filter((service) => service !== SetErrors)
    );

    expect(() => controller.getService(SetErrors)).toThrow();
  });

  test('a row whose form has services of its own, without SetErrors, cannot show a message', async () => {
    const Own = defineForm(
      { name: field('', Text({ label: 'Name' })) },
      Services([GetValues, SetValue, Validate])
    );
    const controller = await FormController.fromForm<
      { lines: Array<InstanceType<typeof Own>> },
      FormItem<{ lines: Array<InstanceType<typeof Own>> }>
    >({
      items: [
        {
          property: 'lines',
          label: 'Lines',
          value: [{ name: 'Paper' }],
          row: () => new Own()
        }
      ],
      services
    });

    await controller.start();

    expect(
      await controller.getService(SetErrors).run({ 'lines.0.name': ['Taken'] })
    ).toEqual(['Taken']);
  });
});
