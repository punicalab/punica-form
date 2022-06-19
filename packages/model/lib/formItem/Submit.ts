import { IEntity } from '@punica/common';
import { ReadItems, IFormItem } from '.';

export type Submit = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity?: E;
    readItems?: ReadItems;
  }): Promise<boolean>;
};
