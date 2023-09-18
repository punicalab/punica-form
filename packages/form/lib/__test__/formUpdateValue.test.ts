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

  form.on(FormEvents.UPDATE, (d: any) => {
    formData = d;
  });

  formData = await form.start();
});

test('read entity formData', () => {
  formData?.items?.[0].updateValue('property1', 'value update');

  expect(formData?.items?.[0].value).toEqual('value update');
});
