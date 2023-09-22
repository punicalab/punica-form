import { IReader, FormItem, Form, DECORATOR_SERVICES } from '../..';

/**
 *
 */
class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
  private _form: Form<E, F>;

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

      this._form = initialForm || {
        items: null,
        initializer: null
      };

      this._form.services = Reflect.getMetadata(DECORATOR_SERVICES, entity);

      resolve(this._form);
    });
  }
}

export default Reader;
