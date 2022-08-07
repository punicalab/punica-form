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

  formData = await form.render(reader);
});

test('get item control', () => {
  const property2Index: number = formData?.itemsMap?.['property2'] || 0;
  const property3Index: number = formData?.itemsMap?.['property3'] || 0;
  const property2 = formData?.items?.[property2Index];
  const property3 = formData?.items?.[property3Index];

  property2.updateValue(property2.property, 'value update');

  expect(property3.hidden).toEqual(true);
});
