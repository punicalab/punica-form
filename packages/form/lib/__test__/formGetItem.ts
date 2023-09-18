import { FormEvents, Form } from '@punica/form';
import { FormA } from '@punica/form-example';
import { FormController } from '..';
import { StoreManager } from '../storeManager';
import { createInitialReader } from '../reader';

let formData: Form<any>;

beforeAll(async () => {
  const entity = new FormA();
  const storeManager = new StoreManager();
  const reader = createInitialReader();
  const form = new FormController(storeManager, entity, reader);

  formData = await form.start();

  form.on(FormEvents.UPDATE, (d: any) => {
    formData = d;
  });

  formData = await form.start();
});

test('get item control', () => {
  const property2Index: number = formData?.itemsMap?.['property2'] || 0;
  const property3Index: number = formData?.itemsMap?.['property3'] || 0;
  const property2 = formData?.items?.[property2Index];
  const property3 = formData?.items?.[property3Index];

  property2.updateValue(property2.property, 'value update');

  expect(property3.hidden).toEqual(true);
});
