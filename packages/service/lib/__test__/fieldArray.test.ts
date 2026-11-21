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
type Invoice = { customer: string; lines: LineValues[] };
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
  Submit
];

const createForm = (lines: Partial<Item> = {}): Form<Invoice, Item> => ({
  items: [
    { property: 'customer', label: 'Customer', value: 'Jane' },
    {
      property: 'lines',
      label: 'Lines',
      value: [
        { name: 'Paper', price: 5 },
        { name: 'Ink', price: 20 }
      ],
      row: () => new Line(),
      ...lines
    }
  ],
  services
});

describe('FieldArray', () => {
  let controller: FormController<Invoice, Item>;
  let notifications: number;

  const start = async (lines?: Partial<Item>) => {
    controller = await FormController.fromForm(createForm(lines));
    await controller.start();
    notifications = 0;
    controller.subscribe(() => notifications++);
  };

  const list = () => controller.getService(FieldArray);
  const rows = () => list().rows('lines');
  const item = () => controller.getForm().items[1];
  const names = () => (item().value as LineValues[]).map(({ name }) => name);
  const setName = (index: number, name: string) =>
    rows()[index].controller.getService(SetValue).run('name', name);

  beforeEach(() => start());

  test('a row is created for every value of the list', () => {
    expect(rows()).toHaveLength(2);
    expect(rows()[1].controller.getForm().items[0].value).toBe('Ink');
    expect(new Set(rows().map((row) => row.key)).size).toBe(2);

    // The item holds the values of the rows, as instances of the row class
    expect(item().value).toEqual([
      { name: 'Paper', price: 5 },
      { name: 'Ink', price: 20 }
    ]);
    expect(item().value[0]).toBeInstanceOf(Line);
    expect(item().dirty).toBeFalsy();
    expect(controller.getForm().state).toMatchObject({
      dirty: false,
      valid: true
    });
  });

  test('a row that changes changes the item of the list, once', async () => {
    const before = rows();
    const second = item().value[1];

    await setName(0, 'Pen');

    expect(names()).toEqual(['Pen', 'Ink']);
    expect(notifications).toBe(1);
    expect(item().dirty).toBe(true);
    expect(controller.getForm().state?.dirty).toBe(true);

    // Only what changed is new
    expect(rows()).toBe(before);
    expect(item().value[1]).toBe(second);

    await setName(0, 'Paper');

    expect(item().dirty).toBe(false);
  });

  test('append, insert, remove and move keep the rows and notify once each', async () => {
    const [paper, ink] = rows();
    const pen = await list().append('lines', { name: 'Pen' });

    expect(names()).toEqual(['Paper', 'Ink', 'Pen']);
    expect(item().value[2]).toEqual({ name: 'Pen', price: 0 });
    expect(notifications).toBe(1);
    expect(rows()).toEqual([paper, ink, pen]);

    const glue = await list().insert('lines', 1);

    expect(names()).toEqual(['Paper', '', 'Ink', 'Pen']);

    await list().move('lines', 3, 0);

    expect(rows()).toEqual([pen, paper, glue, ink]);
    expect(names()).toEqual(['Pen', 'Paper', '', 'Ink']);

    await list().remove('lines', 2);
    await list().remove('lines', pen);

    expect(rows()).toEqual([paper, ink]);
    expect(names()).toEqual(['Paper', 'Ink']);
    expect(notifications).toBe(5);

    // Back to the values the form was started with
    expect(item().dirty).toBe(false);

    // A row that was removed is not followed any more
    await pen.controller.getService(SetValue).run('name', 'Gone');

    expect(names()).toEqual(['Paper', 'Ink']);
    expect(notifications).toBe(5);
  });

  test('changes that do not apply are ignored', async () => {
    const before = rows();

    await list().remove('lines', 7);
    await list().move('lines', 0, 7);
    await list().move('lines', 1, 1);

    expect(rows()).toBe(before);
    expect(notifications).toBe(0);
    expect(() => list().rows('customer' as never)).toThrow('Not a list');
    await expect(list().append('customer' as never)).rejects.toThrow(
      'Not a list'
    );
  });

  test('changes started together are applied in the order of the calls', async () => {
    await Promise.all([
      list().append('lines', { name: 'A' }),
      list().remove('lines', 0),
      list().append('lines', { name: 'B' }),
      list().move('lines', 0, 2)
    ]);

    expect(names()).toEqual(['A', 'B', 'Ink']);
  });

  test('replace and SetValue give the list new rows', async () => {
    const before = rows();

    await list().replace('lines', [{ name: 'Pen', price: 1 }]);

    expect(names()).toEqual(['Pen']);
    expect(rows()).not.toBe(before);

    await controller.getService(SetValue).run('lines', [
      { name: 'A', price: 1 },
      { name: 'B', price: 2 }
    ]);

    expect(names()).toEqual(['A', 'B']);
    expect(rows()[1].controller.getForm().items[1].value).toBe(2);
    expect(item().value[0]).toBeInstanceOf(Line);
  });

  test('validating the form validates the rows', async () => {
    await setName(1, '');

    expect(controller.getForm().state?.valid).toBe(true);
    expect(await controller.getService(Validate).run()).toBe(false);

    expect(rows()[1].controller.getForm().items[0].errorMessages).toEqual([
      'is required'
    ]);
    expect(rows()[0].controller.getForm().state?.valid).toBe(true);
    expect(item().error).toBe(true);
    expect(controller.getForm().state?.valid).toBe(false);

    // The row is corrected and validated on its own: the list follows
    await setName(1, 'Ink');
    await rows()[1].controller.getService(Trigger).run('name');

    expect(item().error).toBe(false);
    expect(controller.getForm().state?.valid).toBe(true);
    expect(await controller.getService(Validate).run()).toBe(true);
  });

  test('the validation of the item itself counts besides the rows', async () => {
    await start({
      validation: async ({ formItem }) => ({
        error: formItem.value.length < 2,
        errorMessages: formItem.value.length < 2 ? ['Add two lines'] : []
      })
    });

    expect(await controller.getService(Validate).run()).toBe(true);

    await list().remove('lines', 0);
    await controller.getService(Trigger).run('lines');

    expect(item()).toMatchObject({
      error: true,
      errorMessages: ['Add two lines']
    });

    // Its own error stays when a row changes
    await setName(0, 'Pen');

    expect(item()).toMatchObject({
      error: true,
      errorMessages: ['Add two lines']
    });

    await list().append('lines', { name: 'Glue' });
    await controller.getService(Trigger).run('lines');

    expect(item()).toMatchObject({ error: false, errorMessages: [] });
  });

  test('a hidden list is not validated', async () => {
    await start({ hidden: true });
    await setName(0, '');

    expect(await controller.getService(Validate).run()).toBe(true);
    expect(rows()[0].controller.getForm().items[0].error).toBeFalsy();
  });

  test('Submit hands over the values of the rows, and not while one is invalid', async () => {
    const handler = jest.fn();

    await setName(0, '');

    expect(await controller.getService(Submit).run(handler)).toBe(false);
    expect(handler).not.toHaveBeenCalled();

    await setName(0, 'Pen');

    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(handler).toHaveBeenCalledWith({
      customer: 'Jane',
      lines: [
        { name: 'Pen', price: 5 },
        { name: 'Ink', price: 20 }
      ]
    });
  });

  test('GetValues returns the values of the rows', async () => {
    await rows()[0].controller.getService(SetValue).run('price', 7);
    await list().append('lines', { name: 'Pen' });

    const { lines } = await controller.getService(GetValues).run();

    expect(lines).toEqual([
      { name: 'Paper', price: 7 },
      { name: 'Ink', price: 20 },
      { name: 'Pen', price: 0 }
    ]);
  });

  test('Reset brings back the rows the form was started with', async () => {
    await setName(0, '');
    await list().append('lines', { name: 'Pen' });
    await controller.getService(Validate).run();

    expect(controller.getForm().state).toMatchObject({
      dirty: true,
      valid: false
    });

    await controller.getService(Reset).run();

    expect(names()).toEqual(['Paper', 'Ink']);
    expect(rows()).toHaveLength(2);
    expect(rows()[0].controller.getForm().items[0]).toMatchObject({
      value: 'Paper'
    });
    expect(item().error).toBeFalsy();
    expect(controller.getForm().state).toMatchObject({
      dirty: false,
      valid: true
    });

    // The new rows are followed
    await setName(1, 'Pen');

    expect(names()).toEqual(['Paper', 'Pen']);
  });

  test('a row that is added while the form is reset does not survive', async () => {
    const added = list().append('lines', { name: 'Pen' });
    const reset = controller.getService(Reset).run();

    await Promise.all([added, reset]);

    expect(names()).toEqual(['Paper', 'Ink']);
  });

  test('ResetItem brings back the rows of one list', async () => {
    await controller.getService(SetValue).run('customer', 'John');
    await list().remove('lines', 0);
    await controller.getService(ResetItem).run('lines');

    expect(names()).toEqual(['Paper', 'Ink']);
    expect(rows()).toHaveLength(2);
    expect(controller.getForm().items[0].value).toBe('John');
  });

  test('ClearErrors and ClearError clear the errors of the rows', async () => {
    for (const clear of [
      () => controller.getService(ClearErrors).run(),
      () => controller.getService(ClearError).run('lines')
    ]) {
      await setName(0, '');
      await controller.getService(Validate).run();

      expect(item().error).toBe(true);

      await clear();

      expect(rows()[0].controller.getForm().items[0].error).toBe(false);
      expect(item().error).toBe(false);
      expect(controller.getForm().state?.valid).toBe(true);
    }
  });

  test('a list is touched when one of its rows is', async () => {
    await rows()[1].controller.getService(Touch).run('name');

    expect(item().touched).toBe(true);
    expect(controller.getForm().state?.touched).toBe(true);
    expect(item().dirty).toBeFalsy();
  });

  test('a row class with services of its own keeps them', async () => {
    const Own = defineForm(
      { name: field('', Text({ label: 'Name' })) },
      Services([SetValue])
    );

    await start({ row: () => new Own(), value: [{ name: 'a' }] });

    const [row] = rows();

    await row.controller.getService(SetValue).run('name' as never, 'b');

    expect(item().value).toEqual([{ name: 'b' }]);
    expect(() => row.controller.getService(Touch)).toThrow('Service not found');

    // The form cannot validate a row that has no Validate
    await expect(controller.getService(Validate).run()).rejects.toThrow(
      'Service not found: Validate'
    );
  });

  test('a row may hold a list of its own', async () => {
    const Order = defineForm({
      number: field('', Text({ label: 'Number' })),
      lines: field<LineValues[]>(
        [],
        Text({ label: 'Lines', row: () => new Line() })
      )
    });

    type Orders = { orders: Array<InstanceType<typeof Order>> };

    const orders = await FormController.fromForm<Orders>({
      items: [
        {
          property: 'orders',
          label: 'Orders',
          value: [{ number: '1', lines: [{ name: 'Paper', price: 5 }] }],
          row: () => new Order()
        }
      ],
      services
    });

    await orders.start();

    const [order] = orders.getService(FieldArray).rows('orders');
    const lines = order.controller.getService(FieldArray);

    await lines.append('lines', { name: '' });

    expect(orders.getForm().items[0].value).toEqual([
      {
        number: '1',
        lines: [
          { name: 'Paper', price: 5 },
          { name: '', price: 0 }
        ]
      }
    ]);
    expect(orders.getForm().state?.dirty).toBe(true);
    expect(await orders.getService(Validate).run()).toBe(false);

    await lines.remove('lines', 1);

    expect(await orders.getService(Validate).run()).toBe(true);
    expect(orders.getForm().state?.dirty).toBe(false);
  });

  test('a list without values starts empty', async () => {
    await start({ value: undefined });

    expect(rows()).toEqual([]);
    expect(item().value).toEqual([]);

    await list().append('lines');

    expect(names()).toEqual(['']);
    expect(item().dirty).toBe(true);
  });
});
