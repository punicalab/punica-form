import { Form, FormController } from '@punica/form';
import FormSample from '../__example__/form';
import { Reader } from '../__example__/reader';

describe('service store', () => {
  let formData: Form<any, any>;
  let formController: FormController<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormSample();
    const reader = new Reader();

    formController = new FormController(entity, reader);
    formData = await formController.start();
  });

  /**
   *
   */
  test('read entity schema', () => {
    const [serviceValidate] = formController?.getService('validate');

    console.log(serviceValidate);

    expect(formData.items?.length).toEqual(3);
  });
});
