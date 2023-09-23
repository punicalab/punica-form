import { FormController, Form } from '..';
import { FormA } from '../example/form';
import { Reader } from '../example/reader';

describe('form', () => {
  let formData: Form<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormA();
    const reader = new Reader();
    const formController = new FormController(entity, reader);

    formData = await formController.start();
  });

  /**
   *
   */
  test('disable check', () => {
    const formItem = formData?.items?.[0];

    expect(formItem.disabled).toEqual(true);
  });
});
