import { Form } from '@punica/form';
import { FormD } from '@punica/form-example';
import { FormController } from '..';
import { StoreManager } from '../storeManager';
import { createInitialReader } from '../reader';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormD();
  const storeManager = new StoreManager();
  const reader = createInitialReader();
  const form = new FormController(storeManager, entity, reader);

  formData = await form.start();
});

test('read entity formData', () => {
  expect(formData.title).toEqual('initializer modified');
});
