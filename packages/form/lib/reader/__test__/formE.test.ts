import { Form } from '../..';
import { FormE } from '@punica/form-example';
import { createInitialReader } from '..';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormE();
  const reader = createInitialReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.chapterMap).not.toBeNull();
});
