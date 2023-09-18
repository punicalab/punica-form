import { IEntity } from '@punica/common';
import { Form, IFormItem } from '..';

export interface IReader<F extends IFormItem, E extends IEntity> {
  read(entity: E): Promise<Form<F>>;
}
