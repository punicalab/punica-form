import { FormController } from '@punica/form';
import FormSample from '../__example__/form';
import { Reader } from '../__example__/reader';

describe('service store', () => {
  /**
   *
   */
  test('read entity schema', async () => {
    const entity = new FormSample();
    const reader = new Reader();
    const formController = new FormController(entity, reader);

    await formController.start();

    const [serviceValidate] = formController?.getService('validate');
    const valid = await serviceValidate.run?.();

    expect(valid).toEqual(false);
  });
});
