// The MCP server: tools and resources over the public API of Punica Form,
// its rules and the code validator. Transport-free, so tests connect it to
// an in-memory client.
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createKnowledge } from './knowledge.mjs';
import { createValidator } from './validate.mjs';

const text = (value) => ({ content: [{ type: 'text', text: value }] });

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
    { name: 'punica-form', version: '0.3.0' },
    {
      instructions: `${legacyNote}${versions}. Punica Form is a headless form engine and is rarely in training data: never write an import, a service name or a method from memory. Read get_guide first, look names up with search_api and get_api, and check the code with validate_code before handing it over.`
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
        'Finds exports of the Punica Form packages (@punica/form, @punica/form-service, @punica/form-react, @punica/form-kit) by name or by words in their documentation ("validate", "reader", "field"). Without a query: every export.',
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
