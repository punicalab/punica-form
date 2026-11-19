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
   * Reads the form data from the provided entity.
   * @param {E} entity - The entity to read form data from.
   * @param {Form<E, F>} form - The form to write the metadata to.
   */
  public async read(entity: E, form: Form<E, F>): Promise<void> {
    form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);
    form.starters = Reflect.getMetadata(DECORATOR_STARTERS, entity);
    form.readers = Reflect.getMetadata(DECORATOR_READERS, entity);
  }
}
export default Reader;
