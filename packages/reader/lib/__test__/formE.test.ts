import { IForm } from '@punica/form';
import { FormE } from '@punica/form-example';
import createReader from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormE();
  const reader = createReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.chapterMap).not.toBeNull();
});
