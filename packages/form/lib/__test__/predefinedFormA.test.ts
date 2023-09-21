import { FormA, Reader } from '@punica/form-example';
import { FormController, Form, StoreManager } from '../..';

describe('form', () => {
  let formData: Form<any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormA();
    const storeManager = new StoreManager();
    const reader = new Reader();
    const formController = new FormController(storeManager, entity, reader);

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
