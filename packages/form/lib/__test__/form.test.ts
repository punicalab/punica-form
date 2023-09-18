import { Form } from '@punica/form';
import { FormA } from '@punica/form-example';
import { FormController } from '..';
import { StoreManager } from '../storeManager';
import { createInitialReader } from '../reader';

describe('form', () => {
  let formData: Form<any>;

  beforeAll(async () => {
    const entity = new FormA();
    const storeManager = new StoreManager();
    const reader = createInitialReader();
    const form = new FormController(storeManager, entity, reader);

    formData = await form.start();
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
