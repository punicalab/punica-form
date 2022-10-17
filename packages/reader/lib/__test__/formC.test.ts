import { IForm } from '@punica/form';
import { FormC } from '@punica/form-example';
import createReader from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormC();
  const reader = createReader();

  formData = await reader.read(entity);
});

test('read entity schema', () => {
  expect(formData.title).toEqual('C Form');
});
