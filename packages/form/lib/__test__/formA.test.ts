import { FormA } from '../example/form';
import { Form, createInitialReader } from '..';

describe('formA', () => {
  let formData: Form<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormA();
    const reader = createInitialReader();

    formData = await reader.read(entity);
  });

  /**
   *
   */
  test('read entity schema', () => {
    console.log(formData);
    expect(formData.items?.length).toEqual(3);
  });
});
