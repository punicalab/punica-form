import { IEntity } from '@punica/common';
import { GetItem, IFormItem } from '.';

export type Submit = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity?: E;
    getItem?: GetItem;
  }): Promise<boolean>;
};
