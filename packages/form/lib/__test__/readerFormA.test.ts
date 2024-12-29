import { FormA } from '../__example__/form';
import { Form, createInitialReader } from '..';

describe('formA', () => {
  let form: Form<any, any> = { items: [], itemsMap: {} };

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormA();
    const reader = createInitialReader();

    await reader.read(entity, form);
  });

  /**
   *
   */
  test('read entity schema', () => {
    expect(form.items?.length).toEqual(4);
  });
});
