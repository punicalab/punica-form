// ArkType is published as ES modules only, which the unit tests cannot
// load: it is tested here, against the built package.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FormController } from '@punica/form';
import { SetValue, Validate } from '@punica/form-service';
import { SchemaValidation, schema } from '@punica/form-schema';
import { type } from 'arktype';

test('a form is validated with a schema of ArkType', async () => {
  const controller = await FormController.fromForm({
    items: [
      { property: 'email', label: 'Email', value: 'jane' },
      { property: 'age', label: 'Age', value: 7 }
    ],
    services: [
      SchemaValidation.of(type({ email: 'string.email', age: 'number >= 18' })),
      SetValue,
      Validate
    ]
  });

  await controller.start();

  assert.equal(await controller.getService(Validate).run(), false);

  const [email, age] = controller.getForm().items;

  assert.equal(email.error, true);
  assert.equal(email.errorMessages.length, 1);
  assert.match(age.errorMessages[0], /at least 18/);

  await controller.getService(SetValue).run('email', 'jane@example.com');
  await controller.getService(SetValue).run('age', 30);

  assert.equal(await controller.getService(Validate).run(), true);
});

test('the validation of one item from a schema of ArkType', async () => {
  const validation = schema(type('string.email'));

  assert.equal((await validation({ formItem: { value: 'x' } })).error, true);
  assert.equal(
    (await validation({ formItem: { value: 'a@b.co' } })).error,
    false
  );
});
