import { Form } from '@punica/form';
import { FormE } from '@punica/form-example';
import { FormController } from '..';
import { StoreManager } from '../storeManager';
import { createInitialReader } from '../reader';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormE();
  const storeManager = new StoreManager();
  const reader = createInitialReader();
  const form = new FormController(storeManager, entity, reader);

  formData = await form.start();
});

test('initializer control', () => {
  const property2Index: number = formData?.itemsMap?.['property2'] || 0;
  const property2 = formData?.items?.[property2Index];

  expect(property2.required).toEqual(false);
});
