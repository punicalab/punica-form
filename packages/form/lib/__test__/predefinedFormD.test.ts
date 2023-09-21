import { FormD, Reader } from '@punica/form-example';
import { FormController, Form, StoreManager } from '../..';

describe('form', () => {
  let formData: Form<any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormD();
    const storeManager = new StoreManager();
    const reader = new Reader();
    const formController = new FormController(storeManager, entity, reader);

    formData = await formController.start();
  });

  /**
   *
   */
  test('title checked', () => {
    expect(formData.title).toEqual('initializer modified');
  });
});
