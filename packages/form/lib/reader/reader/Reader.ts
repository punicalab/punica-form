import { IReader, FormItem, Form, DECORATOR_SERVICES } from '../..';

/**
 * Class for reading form data.
 */
class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
  #form: Form<E, F>;

  /**
   * Reads the form data from the entity.
   * @param {E} entity - The entity to read form data from.
   * @param {Form<E, F>} initialForm - Initial form data.
   * @returns {Promise<Form<E, F>>} - Resolves to the form data.
   */
  public read(entity: E, initialForm: Form<E, F>): Promise<Form<E, F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject(new Error('Entity is required'));
      }

      this.#form = initialForm || {
        items: null,
        services: null
      };

      this.#form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);

      resolve(this.#form);
    });
  }
}

export default Reader;
