import { FormController, IService } from '@punica/form';
import FormSample from '../__example__/form';
import { Reader } from '../__example__/reader';

describe('service store', () => {
  let serviceValidate: IService<any, any>;

  /**
   *
   */
  beforeAll(async () => {
    const entity = new FormSample();
    const reader = new Reader();
    const formController = new FormController(entity, reader);

    await formController.start();

    serviceValidate = formController?.getService('validate')[0];
  });

  /**
   *
   */
  test('read entity schema', async () => {
    const valid = await serviceValidate.run?.();

    expect(valid).toEqual(false);
  });
});
