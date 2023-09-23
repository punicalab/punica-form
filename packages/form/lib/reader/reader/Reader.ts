import { IReader, FormItem, Form, DECORATOR_SERVICES } from '../..';

/**
 *
 */
class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
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

      this.#form = initialForm || {
        items: null,
        initialize: null
      };

      this.#form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);

      resolve(this.#form);
    });
  }
}

export default Reader;
