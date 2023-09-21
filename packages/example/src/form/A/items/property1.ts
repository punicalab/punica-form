import { ErrorDetail, IFormItem } from '@punica/form';

const formItem: IFormItem = {
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  initializer: ({ formItem, writeStore }): Promise<Array<IFormItem>> => {
    return new Promise((resolve) => {
      formItem.disabled = true;
      writeStore('key', 'value');
      resolve([formItem]);
    });
  },
  errorChecking: (): Promise<ErrorDetail> => {
    return new Promise((resolve) => {
      const errorDetail: ErrorDetail = { error: false, errorMessages: [] };

      errorDetail.error = true;
      errorDetail.errorMessages = ['is required'];

      resolve(errorDetail);
    });
  }
};

export default formItem;
