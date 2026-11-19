// Checks code that uses Punica Form for the mistakes models make most often:
// names the packages do not export and service calls that do not exist.

/** The name a service registers under: its class name in camelCase. */
const serviceName = (className) => className[0].toLowerCase() + className.slice(1);

const lineOf = (code, index) => code.slice(0, index).split('\n').length;

/** @param {ReturnType<typeof import('./knowledge.mjs').createKnowledge>} knowledge */
export function createValidator(knowledge) {
  const packageNames = knowledge.packages.map((pkg) => pkg.name);
  const services = knowledge.names
    .map((name) => knowledge.get(name))
    .filter((item) => item.kind === 'class' && item.package.endsWith('-service'))
    .map((item) => item.name);

  /** Service calls that take the form as an argument do not exist. */
  const formCall = new RegExp(
    `\\.(${services.map(serviceName).join('|')})\\(\\s*(?:this\\.)?(?:form|mockForm)\\b`,
    'g'
  );

  /**
   * @param {string} code
   * @returns {Array<{ line: number, rule: string, message: string, fix?: string }>}
   */
  function validate(code) {
    const findings = [];
    const add = (index, rule, message, fix) =>
      findings.push({ line: lineOf(code, index), rule, message, fix });

    for (const match of code.matchAll(
      /import\s*(?:type\s*)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
    )) {
      if (!packageNames.includes(match[2])) continue;

      for (const part of match[1].split(',')) {
        const name = part.replace(/^\s*type\s+/, '').trim().split(/\s+as\s+/)[0];
        const item = knowledge.get(name);

        if (!name || item?.package === match[2]) continue;

        add(
          match.index,
          'unknown-export',
          `${match[2]} does not export ${name}.`,
          item
            ? `import it from "${item.package}"`
            : 'it is not part of Punica Form: decorators such as Title or FormItemInputText, readers and form item types belong to your own form system'
        );
      }
    }

    for (const match of code.matchAll(/getServices(?:<[^(\n]*>)?\(([^)]*)\)/g)) {
      for (const [, name] of match[1].matchAll(/['"](\w+)['"]/g)) {
        if (services.includes(name)) {
          add(
            match.index,
            'service-name',
            `Services are registered in camelCase; "${name}" is not found.`,
            `getServices('${serviceName(name)}')`
          );
        }
      }
    }

    for (const match of code.matchAll(formCall)) {
      const fix =
        match[1] === 'setValue'
          ? 'await item.setValue(item.property, value) (SetValue adds setValue to every form item)'
          : `await controller.getServices('${match[1]}').run(${/^(clearError|resetItem|trigger)$/.test(match[1]) ? 'property' : ''})`;

      add(match.index, 'service-call', `There is no ${match[1]}(form, …) method.`, fix);
    }

    for (const match of code.matchAll(/\.validateItem\(/g)) {
      add(
        match.index,
        'service-call',
        'There is no validateItem method.',
        "await controller.getServices('trigger').run(property) (needs new Trigger() in @Services)"
      );
    }

    for (const match of code.matchAll(/FormItemRegister(?:\.getInstance\(\))?\.getRenderer\(/g)) {
      add(
        match.index,
        'register',
        'FormItemRegister has no getRenderer method.',
        'FormItemRegister.getInstance().getItem(type)'
      );
    }

    return findings.sort((a, b) => a.line - b.line);
  }

  return { validate };
}
