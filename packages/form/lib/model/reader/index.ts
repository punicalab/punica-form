import { IEntity } from '@punica/common';
import { Form, IFormItem } from '..';

export interface IReader<F extends IFormItem, E extends IEntity> {
  read(entity: E, initialFormData?: Form<F>): Promise<Form<F>>;
}
