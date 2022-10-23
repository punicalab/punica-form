import { IEntity } from '@punica/common';
import { GetItem, IFormItem, GetStoreItem, SetStoreItem } from '.';

export type FormItemInitializer = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity?: E;
    getItem?: GetItem;
    store?: { get: GetStoreItem; set: SetStoreItem };
  }): Promise<Array<IFormItem>>;
};
