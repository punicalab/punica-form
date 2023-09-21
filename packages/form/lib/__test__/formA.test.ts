import { Form, createInitialReader } from '../..';
import { FormA } from '@punica/form-example';

describe('formA', () => {
  let formData: Form<any>;

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
    expect(formData.items?.length).toEqual(3);
  });
});
