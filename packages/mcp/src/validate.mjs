// Checks code that uses Punica Form for the mistakes models make most often:
// names the packages do not export and calls that do not exist (any more).

const lineOf = (code, index) => code.slice(0, index).split('\n').length;

/** The name of the service a `run`-less call such as `.validate(form)` means. */
const className = (method) => method[0].toUpperCase() + method.slice(1);

/** @param {ReturnType<typeof import('./knowledge.mjs').createKnowledge>} knowledge */
export function createValidator(knowledge) {
  const packageNames = knowledge.packages.map((pkg) => pkg.name);
  const services = knowledge.names
    .map((name) => knowledge.get(name))
    .filter((item) => item.kind === 'class' && item.package.endsWith('-service'))
    .map((item) => item.name);
  const methods = services.map((name) => name[0].toLowerCase() + name.slice(1));

  /** Calls that do not exist, with what to write instead. */
  const rules = [
    {
      rule: 'service-access',
      pattern: /\.getServices\(/g,
      message: 'There is no getServices: services are read by class, not by name.',
      fix: () => 'controller.getService(Validate) (import the class from "@punica/form-service")'
    },
    {
      rule: 'service-call',
      pattern: new RegExp(`\\.(${methods.join('|')})\\(\\s*(?:this\\.)?(?:form|mockForm)\\b`, 'g'),
      message: (match) => `There is no ${match[1]}(form, …) method.`,
      fix: (match) => `await controller.getService(${className(match[1])}).run(…)`
    },
    {
      rule: 'service-call',
      pattern: /\.validateItem\(/g,
      message: 'There is no validateItem method.',
      fix: () => 'await controller.getService(Trigger).run(property)'
    },
    {
      rule: 'service-call',
      pattern: /\b(?:item|formItem|\w+Item)\.setValue\(/g,
      message: 'Form items have no setValue method.',
      fix: () => 'await controller.getService(SetValue).run(property, value)'
    },
    {
      rule: 'events',
      pattern: /\bcontroller\.off\(/g,
      message: 'There is no off method.',
      fix: () => 'call the function controller.on(event, handler) returned'
    },
    {
      rule: 'register',
      pattern: /FormItemRegister\.getInstance\(/g,
      message: 'FormItemRegister is not a singleton.',
      fix: () => 'defaultFormItemRegister.getItem(type), or a register of your own from createFormItemRegister()'
    },
    {
      rule: 'register',
      pattern: /\.getRenderer\(/g,
      message: 'A register has no getRenderer method.',
      fix: () => 'defaultFormItemRegister.getItem(type)'
    },
    {
      rule: 'metadata',
      pattern: /Reflect\.(?:get|define)Metadata\(/g,
      message: 'Punica Form does not use reflect-metadata.',
      fix: () => 'getFormProperty(entity, key) or getFormItemProperties(entity, key) from "@punica/form"'
    }
  ];

  // The rules name what 2.0 removed; for a project that still has 1.x
  // installed that API is correct, so only its imports are checked
  const isLegacy = knowledge.packages.some((pkg) => parseInt(pkg.version) < 2);

  /**
   * @param {string} code
   * @returns {Array<{ line: number, rule: string, message: string, fix: string }>}
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

    for (const { rule, pattern, message, fix } of isLegacy ? [] : rules) {
      for (const match of code.matchAll(pattern)) {
        add(match.index, rule, typeof message === 'string' ? message : message(match), fix(match));
      }
    }

    return findings.sort((a, b) => a.line - b.line);
  }

  return { validate };
}
