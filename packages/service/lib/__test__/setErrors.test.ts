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
  SetErrors,
  SetValue,
  Submit,
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
  ClearError,
  ClearErrors,
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

    expect(rest.sort()).toEqual([
      'No index',
      'No such item',
      'No such row',
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
