import { IForm } from '@punica/form-model';
import { FormA } from '@punica/form-example';
import createReader from '..';

describe('formA', () => {
  let formData: IForm<any>;

  beforeAll(async () => {
    const entity = new FormA();
    const reader = createReader();

    formData = await reader.read(entity);
  });

  test('read entity schema', () => {
    expect(formData.title).toEqual('A Form');
  });
});
