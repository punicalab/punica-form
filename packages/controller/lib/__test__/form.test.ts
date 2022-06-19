import { IForm } from '@punica/form-model';
import createReader from '@punica/form-reader';
import { FormA } from '@punica/form-example';
import { FormController } from '..';

describe('form', () => {
  let formData: IForm<any>;

  beforeAll(async () => {
    const entity = new FormA();
    const form = new FormController(entity);
    const reader = createReader();

    formData = await form.render(reader);
  });

  test('disable check', () => {
    const index = formData?.itemsMap?.['property1'];
    const formItem = formData?.items?.[index];

    expect(formItem.disabled).toEqual(true);
  });

  test('hidden check', () => {
    const index = formData?.itemsMap?.['property2'];
    const formItem = formData?.items?.[index];

    expect(formItem.hidden).toEqual(true);
  });
});
