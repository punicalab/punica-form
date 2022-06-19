import { IFormItem } from '@punica/form-model';

const formItem: IFormItem = {
  label: 'Property 2',
  required: true,
  hiddenChecking: (): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};

export default formItem;
