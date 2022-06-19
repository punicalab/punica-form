import { IEntity } from '@punica/common';
import { ReadItems, IFormItem } from '.';

export type ErrorDetail = {
  error: boolean;
  errorMessage: string;
};

export type ErrorChecking = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity: E;
    readItems: ReadItems;
  }): Promise<ErrorDetail>;
};
