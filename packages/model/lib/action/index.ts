import { IAction, IEntity } from '@punica/common';
import { IFormController, IFormItem } from '..';

export interface IFormAction extends IAction {
  type: 'button' | 'submit' | 'reset';
  render?: <E extends IEntity, F extends IFormItem>(config?: {
    formController: IFormController<E, F>;
  }) => any;
}
