import { FormItem } from '@punica/form';
import { FormItemLayout } from '../../model';

export interface BaseFormItem<E = any> extends FormItem<E> {
  layout?: FormItemLayout;
}
