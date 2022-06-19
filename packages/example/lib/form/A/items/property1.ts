import { IFormItem } from '@punica/form-model';

const formItem: IFormItem = {
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  disabledChecking: (): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};

export default formItem;
