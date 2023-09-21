import { IFormItem } from '..';

export interface IRender<F extends IFormItem> {
  create(props: F): any;
}
