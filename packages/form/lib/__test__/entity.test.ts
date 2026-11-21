import {
  FormController,
  Readers,
  Services,
  defineForm,
  defineFormItem,
  field
} from '..';
import { AppItem } from '../__example__/formSystem';
import { AdminForm, Marker, UserForm } from '../__example__/UserForm';

describe('a form created from a decorated class', () => {
  test('has one item for every decorated property, in their order', async () => {
    const controller = await FormController.fromEntity(new UserForm());
    const { items } = controller.getForm();

    expect(items.map((item) => item.property)).toEqual(['name', 'address']);
    expect(items[0]).toMatchObject({
      type: 'app:text',
      label: 'Name',
      required: true
    });
  });

  test('reads the values of the entity, nested ones by their path', async () => {
    const controller = await FormController.fromEntity(new UserForm());

    expect(controller.getForm().items.map((item) => item.value)).toEqual([
      'Jane',
      'Tunis'
    ]);
  });

  test('runs the initialize function of the items', async () => {
    const controller = await FormController.fromEntity(new UserForm());

    expect(controller.getForm().items[0].disabled).toBe(true);
  });

  test('runs the readers, then the starters', async () => {
    const controller = await FormController.fromEntity<
      UserForm,
      AppItem<UserForm>
    >(new UserForm());
    const form = await controller.start();

    expect(form.title).toEqual('Create User');
    expect(form.items[0].layout).toEqual({ xs: 6 });
    expect(form.started).toBe(true);
    expect(controller.getForm()).toBe(form);
    expect(controller.getService(Marker).name).toEqual('marker');
  });

  test('a decorated property the entity does not hold still gets an item', async () => {
    // What a field without an initializer looks like with the legacy
    // decorators and a compile target below ES2022
    const entity = new UserForm();

    delete (entity as Partial<UserForm>).name;

    const controller = await FormController.fromEntity(entity);

    expect(controller.getForm().items.map((item) => item.property)).toEqual([
      'address',
      'name'
    ]);
  });

  test('every form of a class gets its own service', async () => {
    const first = await FormController.fromEntity(new UserForm());
    const second = await FormController.fromEntity(new UserForm());

    await first.start();
    await second.start();

    expect(first.getService(Marker)).toBeInstanceOf(Marker);
    expect(first.getService(Marker)).not.toBe(second.getService(Marker));
  });

  test('a class inherits the decorators of its base class and overrides them', async () => {
    const controller = await FormController.fromEntity(new AdminForm());
    const form = await controller.start();

    expect(form.items.map((item) => item.property)).toEqual([
      'name',
      'address',
      'role'
    ]);
    expect(form.title).toEqual('Create Admin');

    // The base class keeps its own metadata
    const base = await (
      await FormController.fromEntity(new UserForm())
    ).start();

    expect(base.items).toHaveLength(2);
    expect(base.title).toEqual('Create User');
  });
});

describe('defineForm', () => {
  const Text = defineFormItem<{ label: string }>('define:text', () => null);

  class Capture {
    public get name() {
      return 'capture';
    }
  }

  const UserForm = defineForm(
    {
      name: field('', Text({ label: 'Name' })),
      age: field<number | undefined>(undefined, Text({ label: 'Age' })),
      tags: field(['a'], Text({ label: 'Tags' })),
      // Not an item: no decorator
      id: field(7)
    },
    Services([Capture])
  );

  test('defines a form class without decorator syntax', async () => {
    const controller = await FormController.fromEntity(new UserForm());
    const form = await controller.start();

    expect(form.items).toMatchObject([
      { property: 'name', label: 'Name', type: 'define:text', value: '' },
      { property: 'age', label: 'Age', value: undefined },
      { property: 'tags', label: 'Tags', value: ['a'] }
    ]);
    expect(controller.getService(Capture)).toBeInstanceOf(Capture);
  });

  test('its instances start with their own values, or with the given ones', () => {
    const first = new UserForm();
    const second = new UserForm({ name: 'Jane', age: 30 });

    first.tags.push('b');

    // The values are typed after the fields
    const age: number | undefined = second.age;

    expect(new UserForm().tags).toEqual(['a']);
    expect(second).toMatchObject({ name: 'Jane', age: 30, id: 7 });
    expect(age).toBe(30);
  });

  test('a value that is undefined, or a name objects have, leaves the initial value', () => {
    const Named = defineForm({ name: field('x') });
    const Inherited = defineForm({ valueOf: field('y') });

    expect(new Named({ name: undefined as unknown as string }).name).toEqual(
      'x'
    );
    expect(new Inherited().valueOf).toEqual('y');
  });

  test('decorators are applied like the ones above a class: the last one first', async () => {
    class Other {
      public get name() {
        return 'other';
      }
    }

    const Form = defineForm(
      { name: field('', Text({ label: 'First' }), Text({ label: 'Second' })) },
      Services([Capture]),
      Services([Other])
    );
    const controller = await FormController.fromEntity(new Form());

    await controller.start();

    expect(controller.getForm().items[0].label).toEqual('First');
    expect(controller.getService(Capture)).toBeInstanceOf(Capture);
  });

  test('a class whose reader adds the items is not reported', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const Form = defineForm(
      { id: field(1) },
      Readers([{ read: () => undefined }])
    );

    await FormController.fromEntity(new Form());

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  test('a class without services gets the ones of the options', async () => {
    class Service {
      public get name() {
        return 'given';
      }
    }

    const Plain = defineForm({ id: field(1, Text({ label: 'Id' })) });
    const Own = defineForm(
      { id: field(1, Text({ label: 'Id' })) },
      Services([Marker])
    );
    const options = { services: [Service] };
    const plain = await FormController.fromEntity(new Plain(), options);
    const own = await FormController.fromEntity(new Own(), options);

    await plain.start();
    await own.start();

    expect(plain.getService(Service)).toBeInstanceOf(Service);
    expect(own.getService(Marker)).toBeInstanceOf(Marker);
    expect(() => own.getService(Service)).toThrow('Service not found');
  });

  test('a list of rows without the service that creates them is reported', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();
    const List = defineFormItem<{ label: string; row: () => object }>(
      'define:list',
      () => null
    );
    const controller = await FormController.fromEntity(
      new (defineForm({
        lines: field([], List({ label: 'Lines', row: () => ({}) }))
      }))()
    );

    await controller.start();

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no FieldArray service')
    );
    warn.mockRestore();
  });

  test('a class without form items is reported', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation();

    await FormController.fromEntity(new (defineForm({ id: field(1) }))());

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('has no form items')
    );
    warn.mockRestore();
  });
});
