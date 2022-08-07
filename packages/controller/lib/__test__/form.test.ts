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
    const formItem = formData?.items?.[0];

    expect(formItem.disabled).toEqual(true);
  });

  test('hidden check', () => {
    const formItem = formData?.items?.[1];

    expect(formItem.hidden).toEqual(true);
  });
});
