import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createPunicaFormServer } from '../src/create.mjs';
import { loadPackage, readTypes } from '../src/load.mjs';

// The type declarations the packages of this repository were built with
const types = (path) => readTypes(fileURLToPath(new URL(path, import.meta.url)));
const packages = [
  { name: '@punica/form', version: '0.0.0', files: types('../../form/dist/') },
  { name: '@punica/form-service', version: '0.0.0', files: types('../../service/dist/') }
];
const guide = readFileSync(new URL('../src/guide.md', import.meta.url), 'utf8');

async function connect() {
  const server = createPunicaFormServer({ packages, guide });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '1.0.0' });

  await Promise.all([server.connect(a), client.connect(b)]);

  const call = async (name, args = {}) =>
    (await client.callTool({ name, arguments: args })).content[0].text;

  return { client, call };
}

test('lists the tools and says to look things up', async () => {
  const { client } = await connect();
  const { tools } = await client.listTools();

  assert.deepEqual(tools.map((tool) => tool.name).sort(), [
    'get_api',
    'get_guide',
    'search_api',
    'validate_code'
  ]);
  assert.match(client.getInstructions(), /never write an import/);
});

test('search_api lists exactly the public exports', async () => {
  const { call } = await connect();
  const all = await call('search_api');

  // Reached through index.d.ts
  for (const name of ['FormController', 'defineFormItem', 'IReader', 'FormPropertyDecorator', 'Validate', 'Store']) {
    assert.match(all, new RegExp(`^${name} \\(`, 'm'));
  }

  // Declared in the packages but not exported from them
  for (const name of ['setFormProperty', 'sendToDevTools', 'propertyDecorator', 'validateItem']) {
    assert.doesNotMatch(all, new RegExp(`^${name} \\(`, 'm'));
  }

  assert.match(await call('search_api', { query: 'reset' }), /^ResetItem \(class, @punica\/form-service\)/m);
  assert.match(await call('search_api', { query: 'no-such-thing' }), /Nothing matches/);
});

test('get_api returns the declaration with its documentation', async () => {
  const { call } = await connect();
  const api = await call('get_api', { names: ['Validate', 'defineFormItem', 'Title'] });

  assert.match(api, /## Validate \(class, @punica\/form-service\)/);
  assert.match(api, /run\(\): Promise<boolean>;/);
  assert.match(api, /declare const defineFormItem: <T extends object>\(type: string/);
  assert.match(api, /Title is not exported by @punica\/form or @punica\/form-service/);
});

test('validate_code finds the common mistakes', async () => {
  const { call } = await connect();
  const report = await call('validate_code', {
    code: [
      'import { FormController, Title, Validate } from "@punica/form";',
      'const validate = controller.getServices("validate");',
      'await validate.validate(form);',
      'await service.validateItem(form, "name");',
      'await item.setValue("name", 1);',
      'FormItemRegister.getInstance().getRenderer(type);',
      'form.title = Reflect.getMetadata("title", entity);',
      'controller.off("UPDATE_FORM", handler);'
    ].join('\n')
  });

  assert.match(report, /^10 problems:/);
  assert.match(report, /line 1 unknown-export: @punica\/form does not export Title/);
  assert.match(report, /does not export Validate\. \[fix: import it from "@punica\/form-service"\]/);
  assert.match(report, /line 2 service-access: .*\[fix: controller\.getService\(Validate\)/);
  assert.match(report, /line 3 service-call: .*\[fix: await controller\.getService\(Validate\)\.run/);
  assert.match(report, /line 4 service-call: There is no validateItem method/);
  assert.match(report, /line 5 service-call: Form items have no setValue method/);
  assert.match(report, /line 6 register: FormItemRegister is not a singleton/);
  assert.match(report, /line 6 register: A register has no getRenderer method/);
  assert.match(report, /line 7 metadata: /);
  assert.match(report, /line 8 events: /);
});

test('validate_code accepts correct code', async () => {
  const { call } = await connect();
  const report = await call('validate_code', {
    code: [
      'import { FormController, Services, getFormProperty, type FormItem } from "@punica/form";',
      'import { SetValue, Validate } from "@punica/form-service";',
      'const isValid = await controller.getService(Validate).run();',
      'await controller.getService(SetValue).run("name", value);',
      'const off = controller.on("UPDATE_FORM", handler);'
    ].join('\n')
  });

  assert.match(report, /^No problems/);
});

test('the guide and the resources', async () => {
  const { client, call } = await connect();

  assert.match(await call('get_guide'), /Services are read by class/);

  const { resources } = await client.listResources();
  assert.ok(resources.some((resource) => resource.uri === 'punica-form://api/FormController'));

  const { contents } = await client.readResource({ uri: 'punica-form://api/Reset' });
  assert.match(contents[0].text, /## Reset \(class/);
});

test('loadPackage falls back to the bundled copy', () => {
  const pkg = loadPackage('@punica/form', '/');

  assert.equal(pkg.installed, false);
  assert.ok(pkg.files.has('index.d.ts'));
});
