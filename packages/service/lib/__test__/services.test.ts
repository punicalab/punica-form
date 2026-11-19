import { Form, FormController, FormItem } from '@punica/form';
import { Reset, ResetItem, SetValue, Trigger } from '..';

type Entity = { name: string; age: number };
type Item = FormItem<Entity>;

const createForm = (): Form<Entity, Item> => ({
  items: [
    {
      property: 'name',
      label: 'Name',
      value: 'a',
      // Mirrors the length of the name into the age item
      control: async ({ formItem, getItem }) => [
        { ...getItem('age'), value: formItem.value.length }
      ],
      validation: async ({ formItem }) => ({
        error: !formItem.value,
        errorMessages: formItem.value ? [] : ['is required']
      })
    },
    { property: 'age', label: 'Age', value: 1 }
  ],
  services: [new SetValue(), new Reset(), new ResetItem(), new Trigger()]
});

describe('services', () => {
  let controller: FormController<Entity, Item>;
  let form: Form<Entity, Item>;

  beforeEach(async () => {
    controller = await FormController.fromForm(createForm());
    form = await controller.start();
  });

  test('SetValue updates the item and the items returned by control', async () => {
    const listener = jest.fn();

    controller.on('UPDATE_ITEM', listener);
    await form.items[0].setValue('name', 'abc');

    expect(form.items[0].value).toEqual('abc');
    expect(form.items[1].value).toEqual(3);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  test('SetValue rejects for an unknown property', async () => {
    await expect(
      form.items[0].setValue('unknown' as keyof Entity, 1)
    ).rejects.toThrow('Item not found: unknown');
  });

  test('Reset restores the initial items and keeps them usable', async () => {
    const listener = jest.fn();
    const reset = controller.getServices<Reset<Entity, Item>>('reset');

    controller.on('RESET', listener);
    await form.items[0].setValue('name', 'abc');
    await reset.run();

    expect(form.items.map((item) => item.value)).toEqual(['a', 1]);
    expect(listener).toHaveBeenCalledWith(form);

    // The initial state must survive a change made after a reset
    await form.items[0].setValue('name', 'abcd');
    await reset.run();

    expect(form.items.map((item) => item.value)).toEqual(['a', 1]);
  });

  test('ResetItem restores a single item', async () => {
    const resetItem =
      controller.getServices<ResetItem<Entity, Item>>('resetItem');

    await form.items[0].setValue('name', 'abc');
    await resetItem.run('name');

    expect(form.items.map((item) => item.value)).toEqual(['a', 3]);
    await expect(resetItem.run('unknown' as keyof Entity)).rejects.toThrow(
      'Item not found: unknown'
    );
  });

  test('Trigger validates a single item', async () => {
    const trigger = controller.getServices<Trigger<Entity, Item>>('trigger');

    await form.items[0].setValue('name', '');
    await trigger.run('name');

    expect(form.items[0].error).toEqual(true);
    expect(form.items[0].errorMessages).toEqual(['is required']);
  });
});
