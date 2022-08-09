import { IForm } from '@punica/form-model';
import createReader from '@punica/form-reader';
import { FormE } from '@punica/form-example';
import { FormController } from '..';

let formData: IForm<any>;

beforeAll(async () => {
  const entity = new FormE();
  const form = new FormController(entity);
  const reader = createReader();

  formData = await form.start(reader);
});

test('startup control', () => {
  const property2Index: number = formData?.itemsMap?.['property2'] || 0;
  const property2 = formData?.items?.[property2Index];

  expect(property2.required).toEqual(false);
});
