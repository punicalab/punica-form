// Reads the type declarations of a Punica Form package from disk: the copy
// installed in the project the server is started in, so the answers match
// that version; without one, the copy bundled with this server.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const BUNDLED = fileURLToPath(new URL('../bundled/', import.meta.url));

/** Every .d.ts file below `root`, keyed by its path relative to it. */
export function readTypes(root) {
  const files = new Map();

  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith('.d.ts')) {
      const path = join(entry.parentPath, entry.name);

      files.set(relative(root, path).split(sep).join('/'), readFileSync(path, 'utf8'));
    }
  }

  return files;
}

/**
 * @param {string} name - The package
 * @param {string} [cwd] - The project to look for the package in
 * @param {string} [entry] - A second entry point of the package, such as
 *   `react` for `@punica/form-kit/react`
 * @returns {{ name: string, version: string, files: Map<string, string>, installed: boolean } | undefined}
 *   `undefined` for an entry point the installed version does not have
 */
export function loadPackage(name, cwd = process.cwd(), entry = '') {
  const entryName = entry ? `${name}/${entry}` : name;

  try {
    const require = createRequire(join(cwd, 'package.json'));
    const manifestPath = require.resolve(`${name}/package.json`);
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const root = join(dirname(join(dirname(manifestPath), manifest.types)), entry);

    // An installed version from before the entry point existed: the project
    // cannot import it, so it is not part of what the server knows
    if (entry && !existsSync(root)) return undefined;

    return { name: entryName, version: manifest.version, files: readTypes(root), installed: true };
  } catch {
    const root = join(BUNDLED, name.split('/')[1]);
    const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));

    return { name: entryName, version, files: readTypes(join(root, entry)), installed: false };
  }
}
