import { IEntity } from '@punica/common';
import { IForm, IFormItem } from '..';

export interface IReader<E extends IEntity, F extends IFormItem> {
  read(entity: E): Promise<IForm<F>>;
}
