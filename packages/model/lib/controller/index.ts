import { IEntity } from '@punica/common';
import { IForm, IFormItem, IReader } from '..';

export interface IFormController<E extends IEntity, F extends IFormItem> {
  start(reader: IReader<E, F>, formData: IForm<F>): Promise<IForm<F>>;
  getEntity(): Promise<E>;
  validate(): Promise<boolean>;
  reset(): void;
  updatePropertyValue(formItemKey: string, property: string, data: any): void;
  submitControl(): Promise<boolean>;
  getInitialEntity(): IEntity;
  updateValue(formItemKey: string, value: any): void;
}
