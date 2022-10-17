import { IFormItem } from '@punica/form';

const formItem: IFormItem = {
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  initializer: ({ formItem, getItem }): Promise<Array<IFormItem>> => {
    return new Promise((resolve) => {
      const property2 = getItem('property2');

      property2.required = false;
      formItem.disabled = true;

      resolve([formItem, property2]);
    });
  }
};

export default formItem;
