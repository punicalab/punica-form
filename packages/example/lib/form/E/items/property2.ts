import { IFormItem } from '@punica/form-model';

const formItem: IFormItem = {
  label: 'Property 2',
  required: true,
  initializer: ({ formItem }): Promise<Array<IFormItem>> => {
    return new Promise((resolve) => {
      formItem.hidden = true;

      resolve([formItem]);
    });
  }
};

export default formItem;
