import {
  FormItem,
  Form,
  IReader,
  DECORATOR_SERVICES,
  DECORATOR_STARTERS,
  DECORATOR_READERS
} from '../..';

/**
 * Class for reading form data.
 */
class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
  /**
   *
   */
  constructor() {}

  /**
   * Reads the form data from the provided entity.
   * @param {E} entity - The entity to read form data from.
   * @returns {Promise<Form<E, F>>} form - Resolves to the form data.
   * @throws {Error} - If the entity is not provided.
   */
  public read(entity: E, form: Form<E, F>): Promise<void> {
    return new Promise((resolve) => {
      // Retrieves services metadata from the entity using reflection
      form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);

      // Retrieves starters metadata from the entity using reflection
      form.starters = Reflect.getMetadata(DECORATOR_STARTERS, entity);

      // Retrieves starters metadata from the entity using reflection
      form.readers = Reflect.getMetadata(DECORATOR_READERS, entity);

      resolve();
    });
  }
}
export default Reader;
