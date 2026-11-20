import {
  BUILT_IN_RULES,
  LIMITS,
  RESERVED_PROPS,
  isSlowPattern
} from './limits';
import { DefinitionProblem } from './types';

export type ValidateDefinitionOptions = {
  /** The types an item may have. Any type is accepted without it. */
  types?: readonly string[];

  /** The rules of the application, besides the built-in ones. */
  rules?: readonly string[];
};

/** Keys that would reach the prototype of an object they are written to. */
const UNSAFE = ['__proto__', 'constructor', 'prototype'];

const isObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    [Object.prototype, null].includes(Object.getPrototypeOf(value))
  );
};

/**
 * Checks a form definition, whatever it is. Besides its shape this checks
 * what makes a definition safe and usable: it holds nothing but data, its
 * properties are unique, its conditions point to items that exist, its rules
 * are known and its size is within the limits.
 * @returns The problems of the definition; none when it is valid
 */
export const validateDefinition = (
  input: unknown,
  options: ValidateDefinitionOptions = {}
): DefinitionProblem[] => {
  const problems: DefinitionProblem[] = [];
  const ruleNames: readonly string[] = [
    ...BUILT_IN_RULES,
    ...(options.rules ?? [])
  ];
  const report = (path: string, message: string): void => {
    problems.push({ path, message });
  };

  /** Whether the object has no keys but the given ones; reports the others. */
  const keys = (
    value: Record<string, unknown>,
    path: string,
    allowed: string[]
  ): void => {
    for (const key of Object.keys(value)) {
      if (!allowed.includes(key)) {
        report(
          path ? `${path}.${key}` : key,
          `is not a known key. Known: ${allowed.join(', ')}`
        );
      }
    }
  };

  const text = (
    value: unknown,
    path: string,
    { required = false, max = LIMITS.text as number } = {}
  ): value is string => {
    if (value === undefined && !required) return false;

    if (typeof value !== 'string') {
      report(path, 'must be a string');
    } else if (required && !value) {
      report(path, 'must not be empty');
    } else if (value.length > max) {
      report(path, `must be at most ${max} characters`);
    } else {
      return true;
    }

    return false;
  };

  /** Checks that a value is JSON: no functions, no class instances, not too deep. */
  const json = (value: unknown, path: string, depth = 0): void => {
    if (depth > LIMITS.depth) {
      report(path, `is nested deeper than ${LIMITS.depth} levels`);
    } else if (typeof value === 'string') {
      text(value, path);
    } else if (Array.isArray(value)) {
      value.forEach((entry, index) =>
        json(entry, `${path}[${index}]`, depth + 1)
      );
    } else if (isObject(value)) {
      for (const [key, entry] of Object.entries(value)) {
        if (UNSAFE.includes(key)) report(`${path}.${key}`, 'is not allowed');
        else json(entry, `${path}.${key}`, depth + 1);
      }
    } else if (
      value !== null &&
      typeof value !== 'boolean' &&
      !(typeof value === 'number' && Number.isFinite(value))
    ) {
      report(path, 'must be a JSON value');
    }
  };

  const properties = new Set<string>();

  const condition = (
    value: unknown,
    path: string,
    own: string,
    depth = 0
  ): void => {
    if (!isObject(value)) {
      report(path, 'must be an object');

      return;
    }

    if (depth > LIMITS.depth) {
      report(path, `is nested deeper than ${LIMITS.depth} levels`);

      return;
    }

    const group = ['all', 'any'].find((key) => key in value);

    if (group) {
      const members = value[group];

      keys(value, path, [group]);

      if (!Array.isArray(members) || !members.length) {
        report(`${path}.${group}`, 'must be an array with a condition');
      } else {
        members.forEach((member, index) =>
          condition(member, `${path}.${group}[${index}]`, own, depth + 1)
        );
      }

      return;
    }

    const operators = ['equals', 'notEquals', 'in'].filter(
      (key) => key in value
    );

    keys(value, path, ['property', 'equals', 'notEquals', 'in']);

    if (operators.length !== 1) {
      report(path, 'must have exactly one of equals, notEquals, in, all, any');
    } else if (operators[0] === 'in' && !Array.isArray(value.in)) {
      report(`${path}.in`, 'must be an array');
    } else {
      json(value[operators[0]], `${path}.${operators[0]}`);
    }

    if (text(value.property, `${path}.property`, { required: true })) {
      if (value.property === own) {
        report(`${path}.property`, 'must be another item, not the item itself');
      } else if (!properties.has(value.property)) {
        report(
          `${path}.property`,
          `"${value.property}" is not a property of an item`
        );
      }
    }
  };

  const rule = (value: unknown, path: string): void => {
    if (!isObject(value)) {
      report(path, 'must be an object');

      return;
    }

    keys(value, path, ['rule', 'value', 'message']);

    // An empty message would block the form without saying why
    if (value.message !== undefined) {
      text(value.message, `${path}.message`, { required: true });
    }

    if (!text(value.rule, `${path}.rule`, { required: true })) return;

    const limit = value.value;
    const valuePath = `${path}.value`;

    if (!ruleNames.includes(value.rule)) {
      report(
        `${path}.rule`,
        `"${value.rule}" is not a known rule. Known: ${ruleNames.join(', ')}`
      );
    } else if (['required', 'email', 'integer'].includes(value.rule)) {
      if (limit !== undefined) report(valuePath, 'is not used by this rule');
    } else if (value.rule === 'min' || value.rule === 'max') {
      if (typeof limit !== 'number' || !Number.isFinite(limit)) {
        report(valuePath, 'must be a number');
      }
    } else if (value.rule === 'minLength' || value.rule === 'maxLength') {
      if (!Number.isInteger(limit) || (limit as number) < 0) {
        report(valuePath, 'must be a whole number, 0 or greater');
      }
    } else if (value.rule === 'pattern') {
      if (text(limit, valuePath, { required: true, max: LIMITS.pattern })) {
        try {
          new RegExp(limit);

          if (isSlowPattern(limit)) {
            report(
              valuePath,
              'repeats a group that repeats, which can freeze the page; write it without nested repetition'
            );
          }
        } catch {
          report(valuePath, 'must be a regular expression');
        }
      }
    } else if (limit !== undefined) {
      json(limit, valuePath);
    }
  };

  const item = (value: unknown, path: string): void => {
    if (!isObject(value)) {
      report(path, 'must be an object');

      return;
    }

    keys(value, path, [
      'property',
      'type',
      'label',
      'value',
      'help',
      'placeholder',
      'disabled',
      'hidden',
      'options',
      'rules',
      'visibleWhen',
      'disabledWhen',
      'props'
    ]);

    text(value.label, `${path}.label`, { required: true });
    text(value.help, `${path}.help`);
    text(value.placeholder, `${path}.placeholder`);

    if (
      text(value.type, `${path}.type`, { required: true, max: LIMITS.name }) &&
      options.types &&
      !options.types.includes(value.type)
    ) {
      report(
        `${path}.type`,
        `"${value.type}" is not a known type. Known: ${options.types.join(', ')}`
      );
    }

    for (const flag of ['disabled', 'hidden']) {
      if (value[flag] !== undefined && typeof value[flag] !== 'boolean') {
        report(`${path}.${flag}`, 'must be true or false');
      }
    }

    if (value.value !== undefined) json(value.value, `${path}.value`);

    if (value.options !== undefined) {
      if (!Array.isArray(value.options)) {
        report(`${path}.options`, 'must be an array');
      } else if (value.options.length > LIMITS.options) {
        report(
          `${path}.options`,
          `must have at most ${LIMITS.options} options`
        );
      } else {
        value.options.forEach((option, index) => {
          const optionPath = `${path}.options[${index}]`;

          if (isObject(option)) {
            keys(option, optionPath, ['value', 'label']);
            text(option.value, `${optionPath}.value`, { required: true });
            text(option.label, `${optionPath}.label`, { required: true });
          } else {
            text(option, optionPath, { required: true });
          }
        });
      }
    }

    if (value.rules !== undefined) {
      if (!Array.isArray(value.rules)) {
        report(`${path}.rules`, 'must be an array');
      } else if (value.rules.length > LIMITS.rules) {
        report(`${path}.rules`, `must have at most ${LIMITS.rules} rules`);
      } else {
        value.rules.forEach((entry, index) =>
          rule(entry, `${path}.rules[${index}]`)
        );
      }
    }

    if (value.props !== undefined) {
      if (isObject(value.props)) {
        json(value.props, `${path}.props`);

        for (const key of Object.keys(value.props)) {
          if ((RESERVED_PROPS as readonly string[]).includes(key)) {
            report(
              `${path}.props.${key}`,
              'belongs to the item itself and cannot be set through props'
            );
          }
        }
      } else {
        report(`${path}.props`, 'must be an object');
      }
    }
  };

  if (!isObject(input)) {
    return [{ path: '', message: 'must be an object' }];
  }

  keys(input, '', [
    'version',
    'name',
    'title',
    'description',
    'columns',
    'items'
  ]);

  if (input.version !== 1) report('version', 'must be 1');

  text(input.name, 'name');
  text(input.title, 'title');
  text(input.description, 'description');

  if (
    input.columns !== undefined &&
    ![1, 2, 3, 4].includes(input.columns as number)
  ) {
    report('columns', 'must be 1, 2, 3 or 4');
  }

  if (!Array.isArray(input.items)) {
    report('items', 'must be an array');

    return problems;
  }

  if (input.items.length > LIMITS.items) {
    report('items', `must have at most ${LIMITS.items} items`);

    return problems;
  }

  // The properties first: conditions may point to items that follow
  input.items.forEach((entry: unknown, index) => {
    const path = `items[${index}].property`;
    const property = isObject(entry) ? entry.property : undefined;

    if (!text(property, path, { required: true, max: LIMITS.name })) return;

    if (UNSAFE.includes(property)) report(path, 'is not allowed');
    else if (properties.has(property))
      report(path, `"${property}" is used twice`);

    properties.add(property);
  });

  input.items.forEach((entry: unknown, index) => {
    const path = `items[${index}]`;

    item(entry, path);

    if (!isObject(entry)) return;

    for (const key of ['visibleWhen', 'disabledWhen']) {
      if (entry[key] !== undefined) {
        condition(entry[key], `${path}.${key}`, String(entry.property));
      }
    }
  });

  return problems;
};
