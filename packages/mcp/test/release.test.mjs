import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';

// The server carries a copy of the packages' types (bundled/) for a project
// that has not installed them. It depends on them only for its build, so a
// release of a package does not release the server by itself: a changeset
// that releases one has to name the server too, or its copy stays behind.
const bundled = [
  '@punica/form',
  '@punica/form-service',
  '@punica/form-react',
  '@punica/form-kit',
  '@punica/form-json',
  '@punica/form-schema'
];
const server = '@punica/form-mcp';

test('a changeset that releases a bundled package releases the server too', () => {
  const dir = new URL('../../../.changeset/', import.meta.url);
  const behind = [];

  for (const file of readdirSync(dir).filter(
    (name) => name.endsWith('.md') && name !== 'README.md'
  )) {
    const front =
      readFileSync(new URL(file, dir), 'utf8').split(/^---$/m)[1] ?? '';
    const names = [
      ...front.matchAll(/^\s*['"]?(@punica\/[\w-]+)['"]?\s*:/gm)
    ].map((match) => match[1]);

    if (names.some((name) => bundled.includes(name)) && !names.includes(server))
      behind.push(file);
  }

  assert.deepEqual(
    behind,
    [],
    `Add '${server}': patch (or minor) to these changesets`
  );
});
