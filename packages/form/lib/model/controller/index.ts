import { IEntity } from '@punica/common';
import {
  IForm,
  IFormItem,
  IReader,
  UpdatePropertyValue,
  UpdateValue,
  GetStoreItem,
  SetStoreItem
} from '..';

export interface IFormController<E extends IEntity, F extends IFormItem> {
  start(reader: IReader<E, F>, formData: IForm<F>): Promise<IForm<F>>;
  getEntity(): Promise<E>;
  validate(): Promise<boolean>;
  reset(): void;
  submitControl(): Promise<boolean>;
  getInitialEntity(): IEntity;
  updatePropertyValue: UpdatePropertyValue;
  updateValue: UpdateValue;
  getStoreItem: GetStoreItem;
  setStoreItem: SetStoreItem;
}
