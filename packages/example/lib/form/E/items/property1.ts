import { IFormItem } from '@punica/form-model';

const formItem: IFormItem = {
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  startup: ({ getItem }): Promise<any> => {
    return new Promise((resolve) => {
      const property2 = getItem('property2');

      property2.required = false;

      resolve([property2]);
    });
  },
  disabledChecking: (): Promise<boolean> => {
    return new Promise((resolve) => {
      resolve(true);
    });
  }
};

export default formItem;
