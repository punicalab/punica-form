import { FormEvents, Form } from '@punica/form';
import { FormA } from '@punica/form-example';
import { FormController } from '..';
import { StoreManager } from '../storeManager';
import { createInitialReader } from '../reader';

let formData: Form<any>;
let form: FormController<any, any>;

beforeAll(async () => {
  const entity = new FormA();
  const storeManager = new StoreManager();
  const reader = createInitialReader();
  form = new FormController(storeManager, entity, reader);

  form.on(FormEvents.UPDATE, (d: any) => {
    formData = d;
  });

  formData = await form.start();
});

test('validate form', async () => {
  const hasError = await form.validate();

  expect(hasError).toEqual(true);
});

test('validate form', async () => {
  const errorMessage = formData?.items?.[0].errorMessage;

  expect(errorMessage).toEqual('is required');
});
