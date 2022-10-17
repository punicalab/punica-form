import { IEntity } from '@punica/common';
import { FormEvents, IFormItem, BaseFormController } from '@punica/form';

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
    const formItem = this.getItem(formItemKey);
    const { control } = formItem;

    formItem.value = value;

    this.writeItems([formItem]);

    if (control) {
      control({
        formItem,
        entity: this._entity,
        getItem: this.getItem
      }).then((formItems: Array<IFormItem>) => {
        this.writeItems(formItems);
        this.fireEvent(FormEvents.UPDATE_ITEM, {
          formItemKey,
          value,
          formItems
        });
        this.fireEvent(FormEvents.UPDATE, this._formData);
      });
    } else {
      this.fireEvent(FormEvents.UPDATE_ITEM, { formItemKey, value });
      this.fireEvent(FormEvents.UPDATE, this._formData);
    }
  }
}

export default FormController;
