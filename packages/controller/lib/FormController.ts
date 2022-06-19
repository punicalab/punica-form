import { IEntity } from '@punica/common';
import { BaseFormController, FormEvents, IFormItem } from '@punica/form-model';

class FormController<
  E extends IEntity,
  F extends IFormItem
> extends BaseFormController<E, F> {
  /**
   *
   * @param entity
   */
  constructor(entity: E = null) {
    super(entity);
  }

  /**
   *
   * @param formItemKey
   * @param value
   */
  public updateValue(formItemKey: string, value: any): void {
    const map = this.readItems([formItemKey]);
    const formItem = map.get(formItemKey);
    const { control } = formItem;

    formItem.value = value;

    this.writeItems([formItem]);

    if (control) {
      control({
        formItem,
        readItems: this.readItems,
        entity: this._entity
      }).then((formItems: Array<IFormItem>) => {
        this.writeItems(formItems);
        this.fireEvent(FormEvents.UPDATE, this._formData);
      });

      return;
    }

    this.fireEvent(FormEvents.UPDATE, this._formData);
  }
}

export default FormController;
