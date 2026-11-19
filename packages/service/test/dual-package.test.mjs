// The ESM and the CommonJS build of @punica/form can be loaded side by side
// (an application and its test runner, for example). Runs against dist.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const esm = await import('@punica/form');
const cjs = require('@punica/form');
const services = await import('@punica/form-service');

test('the two builds are separate copies that share their state', async () => {
  assert.notEqual(esm.FormController, cjs.FormController);
  assert.equal(esm.defaultFormItemRegister, cjs.defaultFormItemRegister);

  cjs.enableDevTools();
  assert.equal(globalThis[Symbol.for('@punica/form')].devTools, true);
  esm.disableDevTools();
});

test('decorators applied through one build are read by the other', async () => {
  class UserForm {
    name = 'Jane';
  }

  // Applied as the legacy decorators of TypeScript apply them
  cjs.defineFormItem('dual:text', () => null)({ label: 'Name' })(UserForm.prototype, 'name');
  cjs.Services([services.GetValues, services.SetValue])(UserForm);

  const controller = await esm.FormController.fromEntity(new UserForm());

  await controller.start();
  await controller.getService(services.SetValue).run('name', 'John');

  const values = await controller.getService(services.GetValues).run();

  assert.ok(values instanceof UserForm);
  assert.equal(values.name, 'John');
  assert.equal(controller.getForm().items[0].type, 'dual:text');
});
