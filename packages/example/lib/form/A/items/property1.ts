import { ErrorDetail, IFormItem } from '@punica/form';

const formItem: IFormItem = {
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  initializer: ({ formItem }): Promise<Array<IFormItem>> => {
    return new Promise((resolve) => {
      formItem.disabled = true;

      resolve([formItem]);
    });
  },
  errorChecking: (): Promise<ErrorDetail> => {
    return new Promise((resolve) => {
      const errorDetail: ErrorDetail = { error: false, errorMessage: '' };

      errorDetail.error = true;
      errorDetail.errorMessage = 'is required';

      resolve(errorDetail);
    });
  }
};

export default formItem;
