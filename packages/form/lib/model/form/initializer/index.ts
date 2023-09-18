import { IEntity } from '@punica/common';
import { Form } from '..';
import { IFormItem } from '../..';

export type Initializer = <F extends IFormItem, E extends IEntity>(
  formData: Form<F>,
  entity: E
) => Promise<Form<F>>;
