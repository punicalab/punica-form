import { IEntity } from '@punica/common';
import { Command } from '.';
import { IFormItem } from '..';

export type FormItemSubmit = {
  <F extends IFormItem, E extends IEntity>(
    command: Command<F, E>
  ): Promise<boolean>;
};
