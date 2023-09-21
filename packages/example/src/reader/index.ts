import { IEntity } from '@punica/common';
import { IReader, Form, IFormItem } from '@punica/form';

/**
 *
 */
export class Reader<F extends IFormItem, E extends IEntity>
  implements IReader<F, E>
{
  private _form: Form<F>;

  /**
   *
   * @param formData
   */
  constructor() {}

  /**
   *
   * @param entity
   * @returns
   */
  public read(entity: E, initialForm: Form<F> = null): Promise<Form<F>> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject();
      }

      this._form = initialForm;

      resolve(this._form);
    });
  }
}
