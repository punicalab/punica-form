import { FormA } from '../__example__/form';
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
    expect(formData.items?.length).toEqual(3);
  });
});
