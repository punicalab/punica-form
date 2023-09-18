import { IEntity } from '@punica/common';
import { IFormItem } from '..';
import { Command } from '.';

export type FormItemControl = {
  <F extends IFormItem, E extends IEntity>(
    command: Command<F, E>
  ): Promise<Array<IFormItem>>;
};
