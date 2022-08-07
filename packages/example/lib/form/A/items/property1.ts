import { ErrorDetail, IFormItem } from '@punica/form-model';

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
