import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createPunicaFormServer } from '../src/create.mjs';
import { loadPackage, readTypes } from '../src/load.mjs';

// The type declarations the packages of this repository were built with
const types = (path) =>
  readTypes(fileURLToPath(new URL(path, import.meta.url)));
const packages = [
  { name: '@punica/form', version: '2.0.0', files: types('../../form/dist/') },
  {
    name: '@punica/form-service',
    version: '2.0.0',
    files: types('../../service/dist/')
  },
  {
    name: '@punica/form-react',
    version: '0.1.0',
    files: types('../../react/dist/')
  },
  {
    name: '@punica/form-kit',
    version: '0.1.0',
    files: types('../../kit/dist/')
  },
  {
    name: '@punica/form-kit/react',
    version: '0.1.0',
    files: types('../../kit/dist/react/')
  },
  {
    name: '@punica/form-kit/json',
    version: '0.1.0',
    files: types('../../kit/dist/json/')
  },
  {
    name: '@punica/form-kit/dom',
    version: '0.1.0',
    files: types('../../kit/dist/dom/')
  },
  {
    name: '@punica/form-json',
    version: '0.1.0',
    files: types('../../json/dist/')
  },
  {
    name: '@punica/form-schema',
    version: '0.1.0',
    files: types('../../schema/dist/')
  }
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
    'get_form_schema',
    'get_guide',
    'search_api',
    'validate_code',
    'validate_form'
  ]);
  assert.match(client.getInstructions(), /never write an import/);
});

test('search_api lists exactly the public exports', async () => {
  const { call } = await connect();
  const all = await call('search_api');

  // Reached through index.d.ts
  for (const name of [
    'FormController',
    'defineFormItem',
    'IReader',
    'FormPropertyDecorator',
    'Validate',
    'Store'
  ]) {
    assert.match(all, new RegExp(`^${name} \\(`, 'm'));
  }

  // Declared in the packages but not exported from them
  for (const name of [
    'setFormProperty',
    'sendToDevTools',
    'propertyDecorator',
    'validateItem'
  ]) {
    assert.doesNotMatch(all, new RegExp(`^${name} \\(`, 'm'));
  }

  // A summary is the first sentence of the documentation: no star of its
  // comment before it, no end of the comment after it
  assert.match(
    all,
    /^ClearError \(class, @punica\/form-service\): Clears the validation error of one item\.$/m
  );
  assert.match(
    all,
    /^FieldArray \(class, @punica\/form-service\): Lists of rows, such as the lines of an invoice\.$/m
  );
  assert.doesNotMatch(all, /\): \*|\*\/$/m);

  assert.match(
    await call('search_api', { query: 'reset' }),
    /^ResetItem \(class, @punica\/form-service\)/m
  );
  assert.match(
    await call('search_api', { query: 'no-such-thing' }),
    /Nothing matches/
  );
});

test('get_api returns the declaration with its documentation', async () => {
  const { call } = await connect();
  const api = await call('get_api', {
    names: ['Validate', 'defineFormItem', 'Title']
  });

  assert.match(api, /## Validate \(class, @punica\/form-service\)/);
  assert.match(api, /run\(\): Promise<boolean>;/);
  assert.match(
    api,
    /declare const defineFormItem: <T extends object>\(type: string/
  );
  assert.match(
    api,
    /Title is not exported by @punica\/form or @punica\/form-service/
  );
});

test('get_api brings the types a declaration is made of that are not exported', async () => {
  const { call } = await connect();
  const api = await call('get_api', { names: ['FormViewProps', 'KitForm'] });

  // FormViewProps = ViewProps<E> & {…}: ViewProps is no export, so it comes with it
  assert.match(api, /type ViewProps<E extends object> = \{/);
  assert.match(api, /submitLabel\?: string;/);
  assert.equal(
    api.match(/type ViewProps</g).length,
    1,
    'KitForm does not name ViewProps'
  );

  // Asked for by its own name, it comes with the exports that hold it, not a list of every export
  const local = await call('get_api', { names: ['ViewProps'] });

  assert.match(
    local,
    /## ViewProps \(not exported, @punica\/form-kit\/react\)/
  );
  assert.match(local, /part of FormViewProps, KitFormProps, which can/);
  assert.match(local, /onSubmit\?: \(values: E/);
  assert.doesNotMatch(local, /Exports: /);
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
  assert.match(
    report,
    /line 1 unknown-export: @punica\/form does not export Title/
  );
  assert.match(
    report,
    /does not export Validate\. \[fix: import it from "@punica\/form-service"\]/
  );
  assert.match(
    report,
    /line 2 service-access: .*\[fix: controller\.getService\(Validate\)/
  );
  assert.match(
    report,
    /line 3 service-call: .*\[fix: await controller\.getService\(Validate\)\.run/
  );
  assert.match(report, /line 4 service-call: There is no validateItem method/);
  assert.match(
    report,
    /line 5 service-call: Form items have no setValue method/
  );
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

test('the React hooks and the form kit are part of the API', async () => {
  const { call } = await connect();
  const all = await call('search_api');

  assert.match(all, /^useFormController \(const, @punica\/form-react\)/m);
  assert.match(all, /^TextField \(const, @punica\/form-kit\)/m);
  assert.match(all, /^KitForm \(function, @punica\/form-kit\/react\)/m);
  assert.match(await call('get_api', { names: ['FormKit'] }), /FormKitOptions/);
  assert.match(await call('get_guide'), /@punica\/form-kit/);

  // Types the kit re-exports with `export type *`
  assert.match(all, /^KitItem \(type, @punica\/form-kit\)/m);
  assert.match(
    await call('validate_code', {
      code: 'import { FormKit, type KitItem } from "@punica/form-kit";'
    }),
    /^No problems/
  );

  // The components live in the second entry point of the kit
  assert.match(
    await call('validate_code', {
      code: 'import { KitForm, TextField } from "@punica/form-kit";'
    }),
    /does not export KitForm\. \[fix: import it from "@punica\/form-kit\/react"\]/
  );
});

test('a project on 1.x is not steered into the 2.x API', async () => {
  const legacy = packages.map((pkg) =>
    pkg.name.startsWith('@punica/form-kit') || pkg.name === '@punica/form-react'
      ? pkg
      : { ...pkg, version: '1.2.0', installed: true }
  );
  const server = createPunicaFormServer({ packages: legacy, guide });
  const [a, b] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: 'test', version: '1.0.0' });

  await Promise.all([server.connect(a), client.connect(b)]);

  const call = async (name, args = {}) =>
    (await client.callTool({ name, arguments: args })).content[0].text;

  assert.match(client.getInstructions(), /documents Punica Form 2/);
  assert.match(
    await call('get_guide'),
    /^This project has @punica\/form 1\.2\.0 installed/
  );
  assert.match(
    await call('validate_code', {
      code: 'controller.getServices("validate"); item.setValue("a", 1);'
    }),
    /^No problems/
  );
});

test('the guide and the resources', async () => {
  const { client, call } = await connect();

  assert.match(await call('get_guide'), /Services are read by class/);

  const { resources } = await client.listResources();
  assert.ok(
    resources.some(
      (resource) => resource.uri === 'punica-form://api/FormController'
    )
  );

  const { contents } = await client.readResource({
    uri: 'punica-form://api/Reset'
  });
  assert.match(contents[0].text, /## Reset \(class/);
});

test('forms as data: the schema, the check and the conversion', async () => {
  const { call } = await connect();
  const schema = await call('get_form_schema');

  assert.match(schema, /Types the form kit renders: text, textarea/);
  assert.equal(
    JSON.parse(schema.slice(schema.indexOf('{\n'))).title,
    'Punica Form definition'
  );

  const item = { property: 'email', type: 'text', label: 'Email' };

  assert.match(
    await call('validate_form', { definition: { version: 1, items: [item] } }),
    /^No problems/
  );
  // As JSON text as well
  assert.match(
    await call('validate_form', {
      definition: JSON.stringify({ version: 1, items: [item] })
    }),
    /^No problems/
  );

  const report = await call('validate_form', {
    definition: {
      version: 1,
      items: [
        {
          ...item,
          type: 'slider',
          rules: [{ rule: 'unique' }],
          onChange: 'alert(1)'
        },
        { ...item, visibleWhen: { property: 'missing', equals: 1 } }
      ]
    }
  });

  assert.match(report, /^5 problems:/);
  assert.match(report, /items\[1\]\.property "email" is used twice/);
  assert.match(report, /items\[0\]\.onChange is not a known key/);
  assert.match(
    report,
    /items\[0\]\.type "slider" is not a known type\. Known: text, textarea/
  );
  assert.match(
    report,
    /items\[0\]\.rules\[0\]\.rule "unique" is not a known rule/
  );
  assert.match(
    report,
    /items\[1\]\.visibleWhen\.property "missing" is not a property of an item/
  );

  // The application's own types and rules
  assert.match(
    await call('validate_form', {
      definition: {
        version: 1,
        items: [{ ...item, type: 'slider', rules: [{ rule: 'unique' }] }]
      },
      types: ['slider'],
      rules: ['unique']
    }),
    /^No problems/
  );

  const converted = await call('validate_form', {
    json_schema: {
      type: 'object',
      required: ['name'],
      properties: { name: { type: 'string', title: 'Name' } }
    }
  });

  assert.match(converted, /^No problems/);
  assert.deepEqual(JSON.parse(converted.slice(converted.indexOf('{'))), {
    version: 1,
    items: [
      {
        property: 'name',
        type: 'text',
        label: 'Name',
        rules: [{ rule: 'required' }]
      }
    ]
  });
  assert.match(
    await call('validate_form', { definition: '{' }),
    /^Not usable: /
  );
  assert.match(
    await call('validate_form', { json_schema: { type: 'array' } }),
    /^Not usable: .*object schema/
  );

  // The package and the component are part of the API
  const all = await call('search_api');

  assert.match(all, /^fromSchema \(const, @punica\/form-json\)/m);
  assert.match(all, /^validateDefinition \(const, @punica\/form-json\)/m);
  assert.match(all, /^JsonForm \(function, @punica\/form-kit\/json\)/m);
});

test('validation with a schema is part of the API', async () => {
  const { call } = await connect();
  const all = await call('search_api');

  assert.match(all, /^SchemaValidation \(class, @punica\/form-schema\)/m);
  assert.match(all, /^schema \(const, @punica\/form-schema\)/m);
  assert.match(all, /^addFormValidation \(const, @punica\/form-service\)/m);
  assert.match(await call('get_guide'), /Standard Schema/);
  assert.match(
    await call('validate_code', {
      code: 'import { Schema, SchemaValidation, schema } from "@punica/form-schema";'
    }),
    /^No problems/
  );
});

test('loadPackage falls back to the bundled copy', () => {
  const pkg = loadPackage('@punica/form', '/');

  assert.equal(pkg.installed, false);
  assert.ok(pkg.files.has('index.d.ts'));
});

test('an entry point the installed version does not have is left out', () => {
  // The kit of this repository is installed; it has no such entry point
  assert.equal(
    loadPackage('@punica/form-kit', process.cwd(), 'missing'),
    undefined
  );
  assert.ok(
    loadPackage('@punica/form-kit', process.cwd(), 'json').files.size > 0
  );
});
