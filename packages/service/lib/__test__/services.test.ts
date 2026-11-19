import {
  CommandItem,
  Form,
  FormController,
  FormItem,
  disableDevTools,
  enableDevTools
} from '@punica/form';
import {
  ClearError,
  ClearErrors,
  GetValues,
  Reset,
  ResetItem,
  SetValue,
  Store,
  StoreCommand,
  Trigger,
  Validate
} from '..';

type Entity = { name: string; age: number; address: { city: string } };
type Item = FormItem<Entity>;

const required: Item['validation'] = async ({ formItem }) => ({
  error: !formItem.value,
  errorMessages: formItem.value ? [] : ['is required']
});

const createForm = (): Form<Entity, Item> => ({
  items: [
    {
      property: 'name',
      label: 'Name',
      value: 'a',
      validation: required,
      // Mirrors the length of the name into the age item
      control: async ({ formItem, getItem }) => [
        { ...(getItem('age') as Item), value: formItem.value.length }
      ]
    },
    { property: 'age', label: 'Age', value: 1 },
    { property: 'address', label: 'City', path: 'address/city', value: 'x' }
  ],
  services: [
    GetValues,
    SetValue,
    Validate,
    Trigger,
    Reset,
    ResetItem,
    ClearError,
    ClearErrors,
    Store
  ]
});

/** A promise and the function that resolves it. */
const gate = () => {
  let open: () => void = () => undefined;
  const closed = new Promise<void>((resolve) => (open = resolve));

  return { closed, open };
};

describe('services', () => {
  let controller: FormController<Entity, Item>;

  const values = () => controller.getForm().items.map((item) => item.value);

  beforeEach(async () => {
    controller = await FormController.fromForm(createForm());
    await controller.start();
  });

  test('SetValue sets the value and writes the items its control returns', async () => {
    const listener = jest.fn();

    controller.on('UPDATE_ITEM', listener);
    await controller.getService(SetValue).run('name', 'abc');

    expect(values()).toEqual(['abc', 3, 'x']);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(
      listener.mock.calls[0][0].map((item: Item) => item.property)
    ).toEqual(['name', 'age']);
  });

  test('services reject for an unknown property', async () => {
    const unknown = 'unknown' as keyof Entity;

    for (const run of [
      () => controller.getService(SetValue).run(unknown, 1),
      () => controller.getService(Trigger).run(unknown),
      () => controller.getService(ResetItem).run(unknown),
      () => controller.getService(ClearError).run(unknown)
    ]) {
      await expect(run()).rejects.toThrow('Item not found: unknown');
    }
  });

  test('Validate validates every item and reports the result', async () => {
    expect(await controller.getService(Validate).run()).toBe(true);

    await controller.getService(SetValue).run('name', '');

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(controller.getForm().items[0]).toMatchObject({
      error: true,
      errorMessages: ['is required']
    });
  });

  test('Validate rejects when a validation function throws', async () => {
    const form = createForm();

    form.items[0].validation = async () => {
      throw new Error('validation failed');
    };

    const failing = await FormController.fromForm(form);

    await failing.start();

    await expect(failing.getService(Validate).run()).rejects.toThrow(
      'validation failed'
    );
  });

  test('a value set while the form is validated is kept', async () => {
    const form = createForm();
    let release: () => void = () => undefined;

    form.items[0].validation = async (command) => {
      await new Promise<void>((resolve) => (release = resolve));

      return (required as NonNullable<Item['validation']>)(command);
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await slow.getService(SetValue).run('age', 42);
    release();
    await validation;

    expect(slow.getForm().items[1].value).toEqual(42);
  });

  test('a value set after its item was validated, while others still are, is kept', async () => {
    const form = createForm();
    const { closed, open } = gate();

    // name is validated first and at once, age is still being validated
    form.items[1].validation = async () => {
      await closed;

      return { error: false };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await Promise.resolve();
    await slow.getService(SetValue).run('address', 'typed');
    open();
    await validation;

    expect(slow.getForm().items[2].value).toEqual('typed');
  });

  test('a slow control function does not revert a newer value', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = async ({ formItem }) => {
      if (formItem.value === 'x') await closed;

      return [{ ...formItem, label: `Name (${formItem.value})` }];
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const first = slow.getService(SetValue).run('name', 'x');

    await slow.getService(SetValue).run('name', 'xy');
    open();
    await first;

    expect(slow.getForm().items[0]).toMatchObject({
      value: 'xy',
      label: 'Name (xy)'
    });
  });

  test('a reset drops the result of a control function that is still running', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = async ({ formItem }) => {
      await closed;

      return [formItem];
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const pending = slow.getService(SetValue).run('name', 'x');

    await slow.getService(Reset).run();
    open();
    await pending;

    expect(slow.getForm().items[0].value).toEqual('a');
  });

  test('forms created with service classes do not share their services', async () => {
    const first = await FormController.fromForm(createForm());
    const second = await FormController.fromForm(createForm());

    await first.start();
    await second.start();
    await first.getService(SetValue).run('age', 42);

    expect(first.getForm().items[1].value).toEqual(42);
    expect(second.getForm().items[1].value).toEqual(1);
  });

  test('GetValues only runs for developer tools when they are enabled', async () => {
    const run = jest.spyOn(GetValues.prototype, 'run');

    await controller.getService(SetValue).run('name', 'abc');

    expect(run).not.toHaveBeenCalled();
    run.mockRestore();
  });

  test('Trigger validates one item; ClearError and ClearErrors clear the result', async () => {
    await controller.getService(SetValue).run('name', '');
    await controller.getService(Trigger).run('name');

    expect(controller.getForm().items[0].error).toBe(true);

    await controller.getService(ClearError).run('name');

    expect(controller.getForm().items[0]).toMatchObject({
      error: false,
      errorMessages: []
    });

    await controller.getService(Trigger).run('name');
    await controller.getService(ClearErrors).run();

    expect(controller.getForm().items.some((item) => item.error)).toBe(false);
  });

  test('Reset restores the initial items, repeatedly, and fires RESET', async () => {
    const listener = jest.fn();

    controller.on('RESET', listener);

    for (const value of ['abc', 'abcd']) {
      await controller.getService(SetValue).run('name', value);
      await controller.getService(Reset).run();

      expect(values()).toEqual(['a', 1, 'x']);
    }

    expect(listener).toHaveBeenLastCalledWith(controller.getForm());
  });

  test('ResetItem restores a single item', async () => {
    await controller.getService(SetValue).run('name', 'abc');
    await controller.getService(ResetItem).run('name');

    expect(values()).toEqual(['a', 3, 'x']);
  });

  test('GetValues fills a copy of the entity, nested values by their path', async () => {
    class User {
      public name = 'a';
      public address = { city: 'x' };
    }

    const entity = new User();
    const withEntity = await FormController.fromForm<User>({
      items: [
        { property: 'name', label: 'Name', value: 'b' },
        { property: 'address', label: 'City', path: 'address/city', value: 'y' }
      ],
      services: [GetValues]
    });

    await withEntity.start();

    // fromForm has no entity: the values are written to an empty object
    expect(await withEntity.getService(GetValues).run()).toEqual({
      name: 'b',
      address: { city: 'y' }
    });
    expect(entity.address.city).toEqual('x');
  });

  test('developer tools receive the entity as GetValues returns it', async () => {
    const postMessage = jest.spyOn(window, 'postMessage').mockImplementation();

    enableDevTools();
    await controller.getService(SetValue).run('name', 'abc');
    await Promise.resolve();
    disableDevTools();

    const entities = postMessage.mock.calls
      .map(([message]) => message)
      .filter((message) => message.type === 'ENTITY');

    expect(JSON.parse(entities[entities.length - 1].data)).toMatchObject({
      name: 'abc',
      age: 3
    });
    expect(
      postMessage.mock.calls.some(([message]) => message.formItemKey === 'name')
    ).toBe(true);

    postMessage.mockRestore();
  });

  test('Store shares values between the functions of the items', async () => {
    const form = createForm();

    form.items[0].validation = async (command) => {
      const { writeStoreItem, readStoreItem } = command as CommandItem<
        Entity,
        Item,
        StoreCommand
      >;

      writeStoreItem('calls', ((readStoreItem('calls') as number) ?? 0) + 1);

      return { error: readStoreItem('calls') !== 2 };
    };

    const stored = await FormController.fromForm(form);

    await stored.start();

    expect(await stored.getService(Validate).run()).toBe(false);
    expect(await stored.getService(Validate).run()).toBe(true);
  });
});
