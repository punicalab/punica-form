import { IEntity } from '@punica/common';
import {
  IReader,
  IFormItem,
  Form,
  DECORATOR_INITIALIZER,
  DECORATOR_STORE
} from '../..';

/**
 *
 */
class Reader<F extends IFormItem, E extends IEntity> implements IReader<F, E> {
  private _form: Form<F>;

  /**
   *
   * @param entity
   * @returns
   */
  public read(entity: E, initialForm: Form<F>): Promise<Form<F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject();
      }

      this._form = initialForm || {
        items: null,
        initializer: null,
        store: null
      };

      this._form.store = Reflect.getMetadata(DECORATOR_STORE, entity);
      this._form.initializer = Reflect.getMetadata(
        DECORATOR_INITIALIZER,
        entity
      );

      if (!this._form.store) {
        this._form.store = {};
      }

      resolve(this._form);
    });
  }
}

export default Reader;
