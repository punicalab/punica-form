import { Form, FormItem, IStarter } from '../..';

/**
 *
 */
export class Starter<E, F extends FormItem<E>> implements IStarter<E, F> {
  /**
   *
   * @returns
   */
  public run(formData: Form<E, F>): Promise<Form<E, F>> {
    return new Promise((resolve) => {
      formData.title = 'initializer modified';

      resolve(formData);
    });
  }
}
