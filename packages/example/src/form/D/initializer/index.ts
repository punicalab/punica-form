import { Form, IFormItem, Initializer } from '@punica/form';

const initializer: Initializer = <F extends IFormItem>(
  formData: Form<F>
): Promise<Form<F>> => {
  return new Promise((resolve) => {
    formData.title = 'initializer modified';

    resolve(formData);
  });
};

export default initializer;
