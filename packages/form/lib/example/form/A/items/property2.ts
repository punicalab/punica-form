import { FormItem } from '../../../..';
import FormA from '..';

const formItem: FormItem<FormA> = {
  property: 'property2',
  label: 'Property 2',
  required: true,
  control: ({ formItem, getItem }) => {
    return new Promise((resolve) => {
      const property3 = getItem('property3');

      property3.hidden = formItem.value != null;
      resolve([property3]);
    });
  },
  initialize: ({ formItem }): Promise<Array<FormItem<FormA>>> => {
    return new Promise((resolve) => {
      formItem.hidden = true;

      resolve([formItem]);
    });
  }
};

export default formItem;
