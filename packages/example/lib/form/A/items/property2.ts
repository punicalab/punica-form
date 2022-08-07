import { IFormItem } from '@punica/form-model';

const formItem: IFormItem = {
  label: 'Property 2',
  required: true,
  control: ({ formItem, getItem }) => {
    return new Promise((resolve) => {
      const property3 = getItem('property3');

      property3.hidden = formItem.value != null;

      resolve([property3]);
    });
  },
  hiddenChecking: (): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};

export default formItem;
