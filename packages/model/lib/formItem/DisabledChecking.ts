import { IEntity } from '@punica/common';
import { IFormItem, ReadItems } from '..';

export type DisabledChecking = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity: E;
    readItems?: ReadItems;
  }): Promise<boolean>;
};
