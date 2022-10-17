import { IEntity } from '@punica/common';
import { IFormItem, IForm } from '..';

export type Initializer = <F extends IFormItem, E extends IEntity>(
  formData: IForm<F>,
  entity: E
) => Promise<IForm<F>>;
