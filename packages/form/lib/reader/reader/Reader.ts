import {
  FormItem,
  Form,
  IReader,
  DECORATOR_SERVICES,
  DECORATOR_STARTERS
} from '../..';

/**
 * Class for reading form data.
 */
class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
  #form: Form<E, F>;

  /**
   * Initializes a new instance of the Reader class.
   * @param {Form<E, F>} initialForm - Initial form data.
   */
  constructor(initialForm: Form<E, F> = null) {
    // Initializes an empty form if initialForm is not provided
    this.#form = initialForm || {
      itemsMap: null,
      items: null,
      services: null,
      starters: null
    };
  }

  /**
   * Reads the form data from the provided entity.
   * @param {E} entity - The entity to read form data from.
   * @returns {Promise<Form<E, F>>} - Resolves to the form data.
   * @throws {Error} - If the entity is not provided.
   */
  public read(entity: E): Promise<Form<E, F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        // Throws an error if the entity is not provided
        reject(new Error('Entity is required'));
      }

      // Retrieves services metadata from the entity using reflection
      this.#form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);

      // Retrieves starters metadata from the entity using reflection
      this.#form.starters = Reflect.getMetadata(DECORATOR_STARTERS, entity);

      // Resolves the promise with the form data
      resolve(this.#form);
    });
  }
}

export default Reader;
