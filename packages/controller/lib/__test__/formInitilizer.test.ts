import { IForm } from '@punica/form-model';
import createReader from '@punica/form-reader';
import { FormD } from '@punica/form-example';
import { FormController } from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormD();
  const form = new FormController(entity);
  const reader = createReader();

  formData = await form.start(reader);
});

test('read entity formData', () => {
  expect(formData.title).toEqual('initializer modified');
});
