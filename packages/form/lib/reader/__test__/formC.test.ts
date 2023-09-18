import { Form } from '../..';
import { FormC } from '@punica/form-example';
import { createInitialReader } from '..';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormC();
  const reader = createInitialReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.title).toEqual('C Form');
});
