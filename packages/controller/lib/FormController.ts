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
   * @param property
   * @param value
   */
  public updateValue(property: string, value: any): void {
    const formItem = this.getItem(property);
    const { control } = formItem;

    formItem.value = value;

    this.writeItems([formItem]);

    if (control) {
      control({
        formItem,
        entity: this._entity,
        getItem: this.getItem,
        store: { get: this.getStoreItem, set: this.setStoreItem }
      }).then((formItems: Array<IFormItem>) => {
        this.writeItems(formItems);
        this.fireEvent(FormEvents.UPDATE_ITEM, [formItem, ...formItems]);
        this.fireEvent(FormEvents.UPDATE, this._formData);
      });
    } else {
      this.fireEvent(FormEvents.UPDATE_ITEM, [formItem]);
      this.fireEvent(FormEvents.UPDATE, this._formData);
    }
  }
}

export default FormController;
