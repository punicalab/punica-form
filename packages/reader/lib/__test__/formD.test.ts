import { IForm } from '@punica/form';
import { FormD } from '@punica/form-example';
import createReader from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormD();
  const reader = createReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.initializer).not.toBeNull();
});
