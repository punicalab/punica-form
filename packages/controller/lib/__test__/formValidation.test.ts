import { FormEvents, IForm } from '@punica/form';
import createReader from '@punica/form-reader';
import { FormA } from '@punica/form-example';
import { FormController } from '..';

let formData: IForm<any>;
let form: FormController<any, any>;

beforeAll(async () => {
  const entity = new FormA();
  form = new FormController(entity);
  const reader = createReader();

  form.on(FormEvents.UPDATE, (d: any) => {
    formData = d;
  });

  formData = await form.start(reader);
});

test('validate form', async () => {
  const hasError = await form.validate();

  expect(hasError).toEqual(true);
});

test('validate form', async () => {
  const errorMessage = formData?.items?.[0].errorMessage;

  expect(errorMessage).toEqual('is required');
});
