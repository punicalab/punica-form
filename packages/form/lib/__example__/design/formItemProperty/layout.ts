import { defineFormItemProperty } from '../../..';
import { FormItemLayout } from '../model';

const DECORATOR_FORM_ITEM_LAYOUT = 'form-item:layout';

const Layout = defineFormItemProperty<FormItemLayout>(
  DECORATOR_FORM_ITEM_LAYOUT
);

export { Layout, DECORATOR_FORM_ITEM_LAYOUT };
