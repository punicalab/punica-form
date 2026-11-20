import {
  CommandService,
  Form,
  FormController,
  FormItem,
  IServiceInitialize,
  IStarter,
  createFormItemRegister,
  defineFormItem
} from '..';

type Entity = { name: string; age: number };
type Item = FormItem<Entity>;

/** Exposes the command services work with. */
class Capture implements IServiceInitialize<Entity, Item> {
  public command!: CommandService<Entity, Item>;

  public get name() {
    return 'capture';
  }

  public initialize(command: CommandService<Entity, Item>) {
    this.command = command;
  }
}

const createForm = (
  extra: Partial<Form<Entity, Item>> = {}
): Form<Entity, Item> => ({
  items: [
    { property: 'name', label: 'Name', value: 'a' },
    { property: 'age', label: 'Age', value: 1 }
  ],
  services: [new Capture()],
  ...extra
});

const start = async (extra?: Partial<Form<Entity, Item>>) => {
  const controller = await FormController.fromForm(createForm(extra));
  const form = await controller.start();

  return { controller, form, command: controller.getService(Capture).command };
};

describe('form controller', () => {
  test('every change produces a new form and leaves the old one untouched', async () => {
    const { controller, form, command } = await start();

    command.setItems([{ ...form.items[0], value: 'b' }]);

    const next = controller.getForm();

    expect(next).not.toBe(form);
    expect(next.items[0].value).toEqual('b');
    expect(form.items[0].value).toEqual('a');
    // Items that did not change keep their identity
    expect(next.items[1]).toBe(form.items[1]);
  });

  test('items of unknown properties are ignored', async () => {
    const { controller, form, command } = await start();

    command.setItems([{ property: 'unknown' as keyof Entity, label: 'x' }]);

    expect(controller.getForm()).toBe(form);
  });

  test('subscribers and UPDATE_FORM listeners are called on a change, until removed', async () => {
    const { controller, form, command } = await start();
    const subscriber = jest.fn();
    const listener = jest.fn();
    const unsubscribe = controller.subscribe(subscriber);
    const off = controller.on('UPDATE_FORM', listener);

    command.setItems([{ ...form.items[0], value: 'b' }]);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(controller.getForm());

    unsubscribe();
    off();
    command.setItems([{ ...form.items[0], value: 'c' }]);

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('item functions receive copies, so the state cannot be changed from outside', async () => {
    const { controller, form, command } = await start();
    const { formItem, getItem } = command.createCommandItem(form.items[0]);

    formItem.value = 'changed';
    (getItem('age') as Item).value = 99;

    expect(controller.getForm().items.map((item) => item.value)).toEqual([
      'a',
      1
    ]);
  });

  test('the initial items are an independent copy', async () => {
    const { form, command } = await start();

    command.setItems([{ ...form.items[0], value: 'b' }]);

    expect(command.getInitialItems()[0].value).toEqual('a');
  });

  test('services see the form the starters produced', async () => {
    const starter: IStarter<Entity, Item> = {
      run: async (form) => ({ ...form, items: [form.items[1]] })
    };
    const { controller, command } = await start({ starters: [starter] });

    expect(command.getForm()).toBe(controller.getForm());
    expect(command.getItem('name')).toBeUndefined();
    expect(command.getItem('age')).toBe(controller.getForm().items[0]);
  });

  test('start publishes the started form and leaves the earlier one untouched', async () => {
    const controller = await FormController.fromForm(
      createForm({
        readers: [{ read: (_entity, form) => void (form.title = 'read') }]
      })
    );
    const before = controller.getForm();
    const subscriber = jest.fn();
    const listener = jest.fn();

    controller.subscribe(subscriber);
    controller.on('UPDATE_FORM', listener);

    const started = await controller.start();

    expect(started).not.toBe(before);
    expect(before.title).toBeUndefined();
    expect(started.title).toEqual('read');
    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(started);
  });

  test('batch notifies once for several changes', async () => {
    const { controller, form, command } = await start();
    const subscriber = jest.fn();

    controller.subscribe(subscriber);

    controller.batch(() => {
      command.setItems([{ ...form.items[0], value: 'b' }]);
      command.setItems([{ ...form.items[1], value: 2 }]);
    });

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(controller.getForm().items.map((item) => item.value)).toEqual([
      'b',
      2
    ]);

    await controller.batch(async () => {
      command.setItems([{ ...form.items[0], value: 'c' }]);
      await Promise.resolve();
      command.setItems([{ ...form.items[1], value: 3 }]);
    });

    expect(subscriber).toHaveBeenCalledTimes(2);

    // Nothing changed: nobody is notified
    controller.batch(() => undefined);

    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  test('a subscriber that throws in a batch does not stop later notifications', async () => {
    const { controller, form, command } = await start();
    const subscriber = jest.fn();
    const remove = controller.subscribe(() => {
      throw new Error('subscriber failed');
    });

    expect(() =>
      controller.batch(() => {
        command.setItems([{ ...form.items[0], value: 'b' }]);
      })
    ).toThrow('subscriber failed');

    remove();
    controller.subscribe(subscriber);
    command.setItems([{ ...form.items[0], value: 'c' }]);

    expect(subscriber).toHaveBeenCalledTimes(1);
  });

  test('supersede tells an older write of a property, or of the form, that it is stale', async () => {
    const { command } = await start();
    const first = command.supersede('name');
    const other = command.supersede('age');

    expect(first()).toBe(true);

    const second = command.supersede('name');

    expect(first()).toBe(false);
    expect(second()).toBe(true);
    expect(other()).toBe(true);

    command.supersede();

    expect(second()).toBe(false);
    expect(other()).toBe(false);
  });

  test('getService finds a service by its base class', async () => {
    class Special extends Capture {}

    const controller = await FormController.fromForm(
      createForm({ services: [Special] })
    );

    await controller.start();

    expect(controller.getService(Capture)).toBeInstanceOf(Special);
  });

  test('getService says so when the form is not started yet', async () => {
    const controller = await FormController.fromForm(createForm());

    expect(() => controller.getService(Capture)).toThrow(
      'Services are available after start()'
    );
  });

  test('a service instance used by a second form is reported', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const service = new Capture();

    await (
      await FormController.fromForm(createForm({ services: [service] }))
    ).start();

    expect(warn).not.toHaveBeenCalled();

    await (
      await FormController.fromForm(createForm({ services: [service] }))
    ).start();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Capture instance')
    );
    warn.mockRestore();
  });

  test('getService throws for a service the form does not have', async () => {
    const controller = await FormController.fromForm(
      createForm({ services: [] })
    );

    await controller.start();

    expect(() => controller.getService(Capture)).toThrow(
      'Service not found: Capture'
    );
  });

  test('start rejects when a reader or a starter throws', async () => {
    const failing = async () => {
      throw new Error('failed');
    };

    await expect(start({ readers: [{ read: failing }] })).rejects.toThrow(
      'failed'
    );
    await expect(start({ starters: [{ run: failing }] })).rejects.toThrow(
      'failed'
    );
  });

  test('REGISTER_ITEMS reports the types of the given register', async () => {
    const register = createFormItemRegister();
    const listener = jest.fn();

    defineFormItem('isolated:text', () => null, { register });

    const controller = await FormController.fromForm(createForm(), {
      register
    });

    controller.on('REGISTER_ITEMS', listener);
    await controller.start();

    expect(listener).toHaveBeenCalledWith(['isolated:text']);
  });

  test('a register keeps the first renderer of a type until it is unregistered', () => {
    const register = createFormItemRegister();
    const first = () => 'first';
    const second = () => 'second';

    register.register('text', first);
    register.register('text', second);

    expect(register.getItem('text')).toBe(first);

    register.unregister('text');
    register.register('text', second);

    expect(register.getItem('text')).toBe(second);
    expect(register.getItemKeys()).toEqual(['text']);
  });
});
