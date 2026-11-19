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
