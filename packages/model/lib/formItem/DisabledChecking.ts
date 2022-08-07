import { IEntity } from '@punica/common';
import { IFormItem, GetItem } from '..';

export type DisabledChecking = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity: E;
    getItem?: GetItem;
  }): Promise<boolean>;
};
