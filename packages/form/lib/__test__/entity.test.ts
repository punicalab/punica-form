import { FormController } from '..';
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
