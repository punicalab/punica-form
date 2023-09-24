import FormSample from '../__example__/form';
import { Form, createInitialReader } from '@punica/form';

describe('service reset', () => {
  let formData: Form<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormSample();
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
