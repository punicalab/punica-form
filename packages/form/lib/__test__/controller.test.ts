import {
  CommandService,
  Form,
  FormController,
  FormItem,
  IServiceInitialize,
  IStarter
} from '..';

type Entity = { name: string; age: number };

class CaptureService implements IServiceInitialize<Entity, FormItem<Entity>> {
  public command: CommandService<Entity, FormItem<Entity>>;

  public get name() {
    return 'capture';
  }

  public async initialize(command: CommandService<Entity, FormItem<Entity>>) {
    this.command = command;
  }
}

const createForm = (
  starters?: Array<IStarter<Entity, FormItem<Entity>>>
): Form<Entity, FormItem<Entity>> => ({
  items: [{ property: 'name', label: 'Name', value: 'a' }],
  services: [new CaptureService()],
  starters
});

describe('form controller', () => {
  test('services see the form produced by starters', async () => {
    const starter: IStarter<Entity, FormItem<Entity>> = {
      run: async (form) => ({
        ...form,
        items: [...form.items, { property: 'age', label: 'Age', value: 1 }]
      })
    };
    const controller = await FormController.fromForm(createForm([starter]));
    const form = await controller.start();
    const { command } = controller.getServices<CaptureService>('capture');

    expect(command.form).toBe(form);
    expect(command.getItem('age')).toBe(form.items[1]);
  });

  test('initial form is an independent copy of the items', async () => {
    const controller = await FormController.fromForm(createForm());
    const form = await controller.start();
    const { command } = controller.getServices<CaptureService>('capture');

    form.items[0].value = 'changed';

    expect(command.initialForm.items[0].value).toEqual('a');
  });

  test('writeItems ignores unknown properties', async () => {
    const controller = await FormController.fromForm(createForm());
    const form = await controller.start();
    const { command } = controller.getServices<CaptureService>('capture');

    await command.writeItems([{ property: 'age', label: 'Age' }]);

    expect(form.items).toHaveLength(1);
  });

  test('REGISTER_ITEMS is fired with an array of keys', async () => {
    const controller = await FormController.fromForm(createForm());
    const listener = jest.fn();

    controller.on('REGISTER_ITEMS', listener);
    await controller.start();

    expect(Array.isArray(listener.mock.calls[0][0])).toBe(true);
  });
});
