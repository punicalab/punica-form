import { Form } from '../..';
import { FormB } from '@punica/form-example';
import { createInitialReader } from '..';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormB();
  const reader = createInitialReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.title).toEqual('B Form');
});
