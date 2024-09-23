import { FormController, Form } from '..';
import { FormA } from '../__example__/form';

describe('form', () => {
  let form: Form<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormA();
    const formController = await FormController.fromEntity(entity);

    form = await formController.start();
  });

  /**
   *
   */
  test('disable check', () => {
    const formItem = form?.items?.[0];

    expect(formItem.disabled).toEqual(true);
  });

  /**
   *
   */
  test('custom title check', () => {
    expect(form.title).toEqual('initializer modified');
  });

  /**
   *
   */
  test('custom description check', () => {
    expect(form.description).toEqual('Description');
  });
});
