import { Form, FormItem, IStarter } from '../../..';

/**
 *
 */
export class Starter<E, F extends FormItem<E>> implements IStarter<E, F> {
  /**
   *
   * @returns
   */
  public run(form: Form<E, F>): Promise<Form<E, F>> {
    return new Promise((resolve) => {
      form.title = 'initializer modified';

      resolve(form);
    });
  }
}
