import { IAction } from '@punica/common';
import { BaseFormController } from '..';

export interface IFormAction extends IAction {
  type: 'button' | 'submit' | 'reset';
  render?: (config?: { formController: BaseFormController<any, any> }) => any;
}
