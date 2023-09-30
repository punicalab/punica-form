import { FormController, Form } from '..';
import { FormA } from '../__example__/form';
import { Reader } from '../__example__/reader';

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

  /**
   *
   */
  test('custom title check', () => {
    expect(formData.title).toEqual('initializer modified');
  });

  /**
   *
   */
  test('custom description check', () => {
    expect(formData.description).toEqual('Description');
  });
});
