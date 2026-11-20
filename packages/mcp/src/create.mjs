// The MCP server: tools and resources over the public API of Punica Form,
// its rules and the code validator. Transport-free, so tests connect it to
// an in-memory client.
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { fromJsonSchema, formDefinitionSchema, validateDefinition } from '@punica/form-json/definition';
import { z } from 'zod';
import { readFileSync } from 'node:fs';
import { createKnowledge } from './knowledge.mjs';
import { createValidator } from './validate.mjs';

const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));

const text = (value) => ({ content: [{ type: 'text', text: value }] });

/** The types a form definition may use when the form kit renders it. */
const KIT_TYPES = ['text', 'textarea', 'number', 'select', 'checkbox', 'switch'];

/** A tool argument that is JSON: given as an object, or as its text. */
const parse = (value) => (typeof value === 'string' ? JSON.parse(value) : value);

/**
 * @param {{ packages: Array<Parameters<typeof createKnowledge>[0][number] & { installed?: boolean }>, guide: string }} options
 *   `installed` says whether the declarations come from the project or from
 *   the copy bundled with the server; the instructions tell the model.
 */
export function createPunicaFormServer({ packages, guide }) {
  const knowledge = createKnowledge(packages);
  const { validate } = createValidator(knowledge);
  const versions = packages
    .map((pkg) => `${pkg.name} ${pkg.version} (${pkg.installed ? 'installed in this project' : 'not installed, bundled copy'})`)
    .join(', ');

  // The guide describes 2.x; a project on 1.x must not be steered into it
  const legacy = packages.find(
    (pkg) => pkg.name === '@punica/form' && parseInt(pkg.version) < 2
  );
  const legacyNote = legacy
    ? `This project has ${legacy.name} ${legacy.version} installed, but this server documents Punica Form 2. search_api and get_api show the installed 1.x API and are correct; get_guide describes 2.x and applies only after upgrading. Do not rewrite 1.x code to the 2.x API unless the user asks to upgrade.\n\n`
    : '';

  const server = new McpServer(
    { name: 'punica-form', version },
    {
      instructions: `${legacyNote}${versions}. Punica Form is a headless form engine and is rarely in training data: never write an import, a service name or a method from memory. Read get_guide first, look names up with search_api and get_api, and check the code with validate_code before handing it over. To produce a form at run time as data instead of code, read get_form_schema and check the definition with validate_form.`
    }
  );

  server.registerTool(
    'get_guide',
    {
      title: 'How to use Punica Form',
      description:
        'The rules of Punica Form: what the packages provide and what the application builds itself, the lifecycle, the immutable state, the services and how to call them, events, and a complete working example.',
      inputSchema: {},
      annotations: { readOnlyHint: true }
    },
    async () => text(legacyNote + guide)
  );

  server.registerTool(
    'search_api',
    {
      title: 'Find Punica Form exports',
      description:
        'Finds exports of the Punica Form packages (@punica/form, @punica/form-service, @punica/form-react, @punica/form-kit, @punica/form-json) by name or by words in their documentation ("validate", "reader", "field"). Without a query: every export.',
      inputSchema: { query: z.string().optional().describe('Words to look for') },
      annotations: { readOnlyHint: true }
    },
    async ({ query }) => {
      const results = knowledge.search(query || '');

      if (!results.length) {
        return text(`Nothing matches "${query}". Exports: ${knowledge.names.join(', ')}`);
      }

      return text(
        results
          .map((item) => `${item.name} (${item.kind}, ${item.package})${item.summary ? `: ${item.summary}` : ''}`)
          .join('\n')
      );
    }
  );

  server.registerTool(
    'get_api',
    {
      title: 'The declaration of an export',
      description:
        'The exact TypeScript declaration and documentation of one or more exports, such as FormController, Validate, TextField or KitForm, read from the installed packages.',
      inputSchema: { names: z.array(z.string()).min(1).max(12).describe('Export names') },
      annotations: { readOnlyHint: true }
    },
    async ({ names }) => text(names.map((name) => knowledge.formatMarkdown(name)).join('\n\n'))
  );

  server.registerTool(
    'validate_code',
    {
      title: 'Check code that uses Punica Form',
      description:
        'Checks TypeScript or JavaScript that uses Punica Form: imports the packages do not export and calls that do not exist, such as the 1.x API. Returns each problem with its line and a fix.',
      inputSchema: { code: z.string().describe('The code to check') },
      annotations: { readOnlyHint: true }
    },
    async ({ code }) => {
      const findings = validate(code);

      if (!findings.length) {
        return text('No problems: every import exists and no removed API is used.');
      }

      return text(
        [
          `${findings.length} problem${findings.length === 1 ? '' : 's'}:`,
          ...findings.map((f) => `line ${f.line} ${f.rule}: ${f.message} [fix: ${f.fix}]`)
        ].join('\n')
      );
    }
  );

  server.registerTool(
    'get_form_schema',
    {
      title: 'The format of a form described as data',
      description:
        'The JSON Schema of a Punica Form definition (@punica/form-json): a form as JSON that an application renders at run time, without code. Read it before writing a form definition, and use it as the schema of structured output.',
      inputSchema: {},
      annotations: { readOnlyHint: true }
    },
    async () =>
      text(
        [
          `Types the form kit renders: ${KIT_TYPES.join(', ')}. An application may have its own.`,
          'Rules: required, email, integer, min, max, minLength, maxLength, pattern; `value` holds the limit. An application may have more.',
          'Conditions (visibleWhen, disabledWhen) compare the value of another item: { property, equals | notEquals | in }, combined with { all: [...] } and { any: [...] }.',
          'A definition holds no code: no functions, no expressions, no HTML. Check it with validate_form.',
          '',
          JSON.stringify(formDefinitionSchema, null, 2)
        ].join('\n')
      )
  );

  server.registerTool(
    'validate_form',
    {
      title: 'Check a form definition',
      description:
        'Checks a form definition (the JSON of @punica/form-json) before it is given to an application: its shape, unknown types and rules, conditions that point to items that do not exist, duplicate properties and anything that is not data. Returns each problem with its path. Give `json_schema` instead to turn a flat JSON Schema into a form definition.',
      inputSchema: {
        definition: z.unknown().optional().describe('The form definition, as an object or as JSON text'),
        json_schema: z.unknown().optional().describe('A JSON Schema to convert into a form definition instead'),
        types: z.array(z.string()).optional().describe('The types the application renders; the types of the form kit by default'),
        rules: z.array(z.string()).optional().describe('Names of rules the application has besides the built-in ones')
      },
      annotations: { readOnlyHint: true }
    },
    async ({ definition, json_schema: schema, types = KIT_TYPES, rules }) => {
      let converted = '';

      try {
        if (schema !== undefined) {
          definition = fromJsonSchema(parse(schema));
          converted = `\n\n${JSON.stringify(definition, null, 2)}`;
        } else {
          definition = parse(definition);
        }
      } catch (error) {
        return text(`Not usable: ${error.message}`);
      }

      const problems = validateDefinition(definition, { types, rules });

      if (!problems.length) {
        return text(`No problems: the form definition is valid.${converted}`);
      }

      return text(
        [
          `${problems.length} problem${problems.length === 1 ? '' : 's'}:`,
          ...problems.map(({ path, message }) => `${path || 'definition'} ${message}`)
        ].join('\n') + converted
      );
    }
  );

  server.registerResource(
    'guide',
    'punica-form://guide',
    { title: 'The rules of Punica Form', mimeType: 'text/markdown' },
    async (uri) => ({ contents: [{ uri: uri.href, mimeType: 'text/markdown', text: guide }] })
  );

  server.registerResource(
    'api',
    new ResourceTemplate('punica-form://api/{name}', {
      list: async () => ({
        resources: knowledge.names.map((name) => ({
          uri: `punica-form://api/${name}`,
          name,
          mimeType: 'text/markdown'
        }))
      })
    }),
    { title: 'The declaration of an export', mimeType: 'text/markdown' },
    async (uri, { name }) => ({
      contents: [{ uri: uri.href, mimeType: 'text/markdown', text: knowledge.formatMarkdown(String(name)) }]
    })
  );

  return server;
}
