import { Form } from '../..';
import { FormD } from '@punica/form-example';
import { createInitialReader } from '..';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormD();
  const reader = createInitialReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.initializer).not.toBeNull();
});
