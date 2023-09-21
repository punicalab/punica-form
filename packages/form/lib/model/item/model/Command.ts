import { IEntity } from '@punica/common';
import { IFormItem } from '..';
import { GetItem, ReadStore, WriteStore } from '../..';

export type Command<F extends IFormItem, E extends IEntity> = {
  formItem: F;
  entity: E;
  getItem: GetItem;
  readStore: ReadStore;
  writeStore: WriteStore;
};
