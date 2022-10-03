import { IEntity } from '@punica/common';
import { GetItem, IFormItem } from '.';

export type ErrorDetail = {
  error: boolean;
  errorMessage: string;
};

export type FormItemError = {
  <F extends IFormItem, E extends IEntity>(config: {
    formItem: F;
    entity: E;
    getItem: GetItem;
  }): Promise<ErrorDetail>;
};