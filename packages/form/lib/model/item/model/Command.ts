import { IEntity } from '@punica/common';
import { IFormItem } from '..';
import { GetItem, GetStoreItem, SetStoreItem } from '../..';

export type Command<F extends IFormItem, E extends IEntity> = {
  formItem: F;
  entity?: E;
  getItem?: GetItem;
  getStoreItem?: GetStoreItem;
  setStoreItem?: SetStoreItem;
};
