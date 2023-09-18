import { IEntity } from '@punica/common';
import { Command } from '.';
import { IFormItem } from '..';

export type ErrorDetail = {
  error: boolean;
  errorMessages: Array<string>;
};

export type FormItemError = {
  <F extends IFormItem, E extends IEntity>(
    comman: Command<F, E>
  ): Promise<ErrorDetail>;
};
