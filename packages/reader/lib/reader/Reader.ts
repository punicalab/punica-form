import { IEntity } from '@punica/common';
import {
  IReader,
  IFormItem,
  IForm,
  DECORATOR_TITLE,
  DECORATOR_NAME,
  DECORATOR_ACTIONS,
  DECORATOR_INITIALIZER,
  DECORATOR_DESCRIPTION,
  DECORATOR_STORE
} from '@punica/form';

/**
 *
 */
class Reader<E extends IEntity, F extends IFormItem> implements IReader<E, F> {
  private _form: IForm<F>;

  /**
   *
   * @param entity
   * @returns
   */
  public read(entity: E): Promise<IForm<F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject();
      }

      this._form = {
        title: null,
        name: null,
        actions: null,
        items: null,
        itemsMap: null,
        description: null,
        initializer: null,
        store: null
      };

      this._form.title = Reflect.getMetadata(DECORATOR_TITLE, entity);
      this._form.name = Reflect.getMetadata(DECORATOR_NAME, entity);
      this._form.actions = Reflect.getMetadata(DECORATOR_ACTIONS, entity);
      this._form.store = Reflect.getMetadata(DECORATOR_STORE, entity);
      this._form.description = Reflect.getMetadata(
        DECORATOR_DESCRIPTION,
        entity
      );
      this._form.initializer = Reflect.getMetadata(
        DECORATOR_INITIALIZER,
        entity
      );

      if (!this._form.store) {
        this._form.store = new Map<string, any>();
      }
      resolve(this._form);
    });
  }
}

export default Reader;
