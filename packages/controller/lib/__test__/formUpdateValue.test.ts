import { FormEvents, IForm } from '@punica/form-model';
import createReader from '@punica/form-reader';
import { FormA } from '@punica/form-example';
import { FormController } from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormA();
  const form = new FormController(entity);
  const reader = createReader();

  form.on(FormEvents.UPDATE, (d: any) => {
    formData = d;
  });

  formData = await form.start(reader);
});

test('read entity formData', () => {
  formData?.items?.[0].updateValue('property1', 'value update');

  expect(formData?.items?.[0].value).toEqual('value update');
});
