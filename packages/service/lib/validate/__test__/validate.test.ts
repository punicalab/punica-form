import { FormController } from '@punica/form';
import FormSample from '../__example__/form';

describe('service store', () => {
  /**
   *
   */
  test('read entity schema', async () => {
    const entity = new FormSample();
    const formController = await FormController.fromEntity(entity);

    await formController.start();

    const validate = formController.getServices('validate');
    const valid = await validate.run();

    expect(valid).toEqual(false);
  });
});
