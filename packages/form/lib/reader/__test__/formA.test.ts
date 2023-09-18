import { Form } from '../..';
import { FormA } from '@punica/form-example';
import { createInitialReader } from '..';

describe('formA', () => {
  let formData: Form<any>;

  beforeAll(async () => {
    const entity = new FormA();
    const reader = createInitialReader();

    formData = await reader.read(entity);
  });

  test('read entity schema', () => {
    expect(formData.title).toEqual('A Form');
  });
});
