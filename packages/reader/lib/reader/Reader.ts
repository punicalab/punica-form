import { IEntity } from '@punica/common';
import {
  IReader,
  IFormItem,
  IForm,
  DECORATOR_TITLE,
  DECORATOR_NAME,
  DECORATOR_ACTIONS,
  DECORATOR_INITIALIZER,
  DECORATOR_DESCRIPTION
} from '@punica/form-model';

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
        initializer: null
      };

      this._form.title = Reflect.getMetadata(DECORATOR_TITLE, entity);
      this._form.name = Reflect.getMetadata(DECORATOR_NAME, entity);
      this._form.actions = Reflect.getMetadata(DECORATOR_ACTIONS, entity);
      this._form.description = Reflect.getMetadata(
        DECORATOR_DESCRIPTION,
        entity
      );
      this._form.initializer = Reflect.getMetadata(
        DECORATOR_INITIALIZER,
        entity
      );

      resolve(this._form);
    });
  }
}

export default Reader;
