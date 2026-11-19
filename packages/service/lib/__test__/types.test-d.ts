/**
 * Type tests: this file is only compiled, never run. Every line marked with
 * `@ts-expect-error` must be a compile error.
 */
import { Form, FormController, FormItem } from '@punica/form';
import { GetValues, SetValue, Store, Trigger, Validate } from '..';

type Entity = { name: string; age: number };
type Item = FormItem<Entity> & { layout?: number };

declare const controller: FormController<Entity, Item>;

export const services = async (): Promise<void> => {
  // Services are bound to the entity of the form
  const values: Entity = await controller.getService(GetValues).run();
  const valid: boolean = await controller.getService(Validate).run();

  await controller.getService(Trigger).run('name');
  await controller.getService(SetValue).run('age', 1);

  // @ts-expect-error 'email' is not a property of the entity
  await controller.getService(Trigger).run('email');

  // @ts-expect-error 'email' is not a property of the entity
  await controller.getService(SetValue).run('email', 1);

  // @ts-expect-error Store has no run method
  await controller.getService(Store).run();

  // @ts-expect-error services are read by class, not by name
  controller.getService('validate');

  void values;
  void valid;
};

export const events = (): void => {
  controller.on('UPDATE_FORM', (form) => {
    const typed: Form<Entity, Item> = form;

    void typed;
  });

  controller.on('UPDATE_ITEM', (items) => {
    // Items keep the type of the form system
    const layout: number | undefined = items[0].layout;

    void layout;
  });

  controller.on('REGISTER_ITEMS', (types) => {
    const typed: string[] = types;

    void typed;
  });

  // @ts-expect-error there is no such event
  controller.on('CHANGE', () => undefined);

  controller.on('RESET', (form) => {
    // @ts-expect-error the payload of RESET is a form, not a list of items
    const items: Item[] = form;

    void items;
  });
};

export const items = (): void => {
  const form = controller.getForm();

  // Custom properties of the item type are known
  const layout: number | undefined = form.items[0].layout;

  // @ts-expect-error items have no properties beyond their type
  form.items[0].unknownProperty;

  // @ts-expect-error property must be a property of the entity
  const item: Item = { property: 'email', label: 'Email' };

  void layout;
  void item;
};
