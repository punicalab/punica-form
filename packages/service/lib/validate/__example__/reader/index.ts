import { IReader, FormItem, Form } from '@punica/form';

/**
 *
 */
export class Reader<E extends Object, F extends FormItem<E>>
  implements IReader<E, F>
{
  #form: Form<E, F>;

  /**
   *
   * @param entity
   * @returns
   */
  public read(entity: E, initialForm: Form<E, F>): Promise<Form<E, F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject();
      }

      this.#form = initialForm;

      resolve(this.#form);
    });
  }
}
