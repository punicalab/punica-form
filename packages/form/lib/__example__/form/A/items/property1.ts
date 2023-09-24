import { ErrorDetail, FormItem } from '../../../..';
import FormA from '..';

const formItem: FormItem<FormA> = {
  property: 'property1',
  label: 'Property 1',
  required: false,
  getData: (): Promise<any> => {
    return new Promise(() => {});
  },
  initialize: ({ formItem }): Promise<Array<FormItem<FormA>>> => {
    return new Promise((resolve) => {
      formItem.disabled = true;

      resolve([formItem]);
    });
  },
  validation: (): Promise<ErrorDetail> => {
    return new Promise((resolve) => {
      const errorDetail: ErrorDetail = { error: false, errorMessages: [] };

      errorDetail.error = true;
      errorDetail.errorMessages = ['is required'];

      resolve(errorDetail);
    });
  }
};

export default formItem;
