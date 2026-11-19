import {
  Form,
  FormItem,
  IReader,
  IStarter,
  defineFormItem,
  defineFormItemProperty,
  defineFormProperty,
  getFormItemProperties,
  getFormProperty
} from '..';

/**
 * A small form system, as an application builds it on top of Punica Form.
 */

export type Layout = { xs: number };

export type AppItem<E> = FormItem<E> & { layout?: Layout };

export const Title = defineFormProperty<string>('app:title');

export const Layout = defineFormItemProperty<Layout>('app:layout');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormItemText = defineFormItem<Omit<AppItem<any>, 'property'>>(
  'app:text',
  (item: AppItem<unknown>) => item
);

/** Reads the title of the form and the layout of its items. */
export class Reader<E extends object, F extends AppItem<E>> implements IReader<
  E,
  F
> {
  public read(entity: E, form: Form<E, F>): void {
    const layouts = getFormItemProperties<Layout>(entity, 'app:layout');

    form.title = getFormProperty<string>(entity, 'app:title');
    form.items = form.items.map((item) => ({
      ...item,
      layout: layouts[String(item.property)]
    }));
  }
}

/** Marks the form as started and returns it as a new object. */
export class Starter<E, F extends FormItem<E>> implements IStarter<E, F> {
  public async run(form: Form<E, F>): Promise<Form<E, F>> {
    return { ...form, started: true };
  }
}
