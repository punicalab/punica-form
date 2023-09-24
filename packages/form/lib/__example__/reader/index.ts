import { IReader, FormItem, Form } from '../..';
import {
  DECORATOR_CUSTOM_DESCRIPTION,
  DECORATOR_CUSTOM_TITLE
} from '../decorator';

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

      this.#form.title = Reflect.getMetadata(
        DECORATOR_CUSTOM_TITLE,
        entity as E
      );

      this.#form.description = Reflect.getMetadata(
        DECORATOR_CUSTOM_DESCRIPTION,
        entity as E
      );

      resolve(this.#form);
    });
  }
}
