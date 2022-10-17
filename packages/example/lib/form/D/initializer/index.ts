import { IForm, IFormItem, Initializer } from '@punica/form';

const initializer: Initializer = <F extends IFormItem>(
  formData: IForm<F>
): Promise<IForm<F>> => {
  return new Promise((resolve) => {
    formData.title = 'initializer modified';

    resolve(formData);
  });
};

export default initializer;
