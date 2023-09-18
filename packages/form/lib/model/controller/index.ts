import { IEntity } from '@punica/common';
import {
  Form,
  IFormItem,
  FormItemUpdateValue,
  GetStoreItem,
  SetStoreItem
} from '..';

export interface IFormController<F extends IFormItem, E extends IEntity> {
  start(): Promise<Form<F>>;
  getEntity(): Promise<E>;
  validate(): Promise<boolean>;
  reset(): Promise<void>;
  controlForAfterSubmit(): Promise<void>;
  getInitialEntity(): IEntity;
  updateValue: FormItemUpdateValue;
  getStoreItem: GetStoreItem;
  setStoreItem: SetStoreItem;
}
