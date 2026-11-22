// What a tool needs to know about the public API of the Punica Form packages,
// read from their type declarations (.d.ts). Pure: it works on file contents,
// so the server, the build and the tests share it.

export const DOCS_URL = 'https://form.punicalab.com';

const DECLARATION =
  /^export (?:declare )?(?:abstract )?(class|const|function|type|interface|enum) (\w+)/gm;

/** The module a relative specifier points to: `./x.d.ts` or `./x/index.d.ts`. */
function resolve(files, from, specifier) {
  const base = new URL(specifier, `file:///${from}`).pathname.slice(1);

  return [`${base}.d.ts`, `${base}/index.d.ts`].find((path) => files.has(path));
}

/** The JSDoc comment that ends right before `index`, if there is one. */
function commentBefore(source, index) {
  const match = /\/\*\*(?:(?!\*\/)[\s\S])*\*\/\s*$/.exec(source.slice(0, index));

  return match ? match[0].trimEnd() : '';
}

/** The declaration that starts at `index`: up to its closing brace or semicolon. */
function declarationAt(source, index) {
  let depth = 0;

  for (let i = index; i < source.length; i++) {
    const char = source[i];

    if ('({['.includes(char)) depth++;
    if (')}]'.includes(char)) depth--;
    if (depth === 0 && (char === ';' || char === '}')) {
      return source.slice(index, i + 1);
    }
  }

  return source.slice(index);
}

function entry(source, index, kind, name) {
  const comment = commentBefore(source, index);
  // The first paragraph of the comment, without its stars, up to the end of
  // its first sentence
  const lines = comment
    .replace(/^\s*\/\*+/, '')
    .replace(/\*+\/\s*$/, '')
    .split('\n')
    .map((line) => line.replace(/^\s*\*+\s?/, '').trim());
  const start = lines.findIndex((line) => line && !line.startsWith('@'));
  const paragraph = [];

  for (let i = start; i >= 0 && i < lines.length; i++) {
    if (!lines[i] || lines[i].startsWith('@') || lines[i].startsWith('```')) break;
    paragraph.push(lines[i]);
  }

  const text = paragraph.join(' ');
  const summary = (/^.*?[.:](?=\s|$)/.exec(text)?.[0] ?? text).replace(/:$/, '.');

  return {
    name,
    kind,
    summary: summary.trim(),
    declaration: [comment, declarationAt(source, index)].filter(Boolean).join('\n')
  };
}

/** Every name a module exports, following its re-exports. */
function exportsOf(files, path, seen = new Set()) {
  if (!path || seen.has(path)) return new Map();
  seen.add(path);

  const source = files.get(path);
  const found = new Map();

  for (const match of source.matchAll(DECLARATION)) {
    found.set(match[2], entry(source, match.index, match[1], match[2]));
  }

  // export * from './x';  export type * from './x';
  for (const match of source.matchAll(/^export (?:type )?\* from ['"](.+?)['"];/gm)) {
    const target = exportsOf(files, resolve(files, path, match[1]), seen);

    for (const [name, value] of target) found.set(name, value);
  }

  // export { a, default as b } from './x';  export type { a } from './x';
  for (const match of source.matchAll(/^export (?:type )?\{([^}]+)\} from ['"](.+?)['"];/gm)) {
    const targetPath = resolve(files, path, match[2]);
    const target = exportsOf(files, targetPath, new Set(seen));
    const targetSource = files.get(targetPath) || '';

    for (const part of match[1].split(',')) {
      const [original, alias = original] = part.trim().split(/\s+as\s+/);
      let value = target.get(original);

      if (original === 'default') {
        // declare const x: …;  export default x;
        const local = (/^export default (\w+);/m.exec(targetSource) || [])[1];
        const declared = new RegExp(
          `^declare (?:abstract )?(class|const|function) ${local}\\b`,
          'm'
        ).exec(targetSource);

        value = declared && entry(targetSource, declared.index, declared[1], alias);
      }

      if (value) found.set(alias, { ...value, name: alias });
    }
  }

  return found;
}

/**
 * @param {Array<{ name: string, version: string, files: Map<string, string> }>} packages
 *   `files` holds the .d.ts files of the package, keyed by their path
 *   relative to its types root (`index.d.ts`, `model/index.d.ts`, …).
 */
export function createKnowledge(packages) {
  const api = new Map();

  for (const pkg of packages) {
    for (const [name, value] of exportsOf(pkg.files, 'index.d.ts')) {
      api.set(name, { ...value, package: pkg.name });
    }
  }

  const names = [...api.keys()].sort();
  const get = (name) => api.get(name);

  /** Names whose own name or documentation holds every word of the query. */
  function search(query) {
    const words = query.toLowerCase().split(/\W+/).filter(Boolean);

    return names
      .map((name) => api.get(name))
      .filter((item) => {
        const text = `${item.name} ${item.declaration}`.toLowerCase();

        return words.every((word) => text.includes(word));
      });
  }

  function formatMarkdown(name) {
    const item = get(name);

    if (!item) {
      return `${name} is not exported by ${packages.map((p) => p.name).join(' or ')}. Exports: ${names.join(', ')}`;
    }

    return `## ${item.name} (${item.kind}, ${item.package})\n\n\`\`\`ts\n${item.declaration}\n\`\`\``;
  }

  return { packages, names, get, search, formatMarkdown };
}
