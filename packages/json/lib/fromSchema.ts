import {
  CommandItem,
  ErrorDetail,
  Form,
  FormController,
  FormItem,
  FormItemRegister,
  IService,
  defaultFormItemRegister
} from '@punica/form';
import {
  GetValues,
  Reset,
  SetValue,
  Submit,
  Touch,
  Trigger,
  Validate
} from '@punica/form-service';
import { holds, propertiesOf } from './conditions';
import {
  DefinitionProblem,
  FormDefinition,
  ItemDefinition,
  OptionDefinition,
  RESERVED_PROPS,
  validateDefinition
} from './definition';
import { Rule, builtInRules, isEmpty } from './rules';

/** The values of a form made from a definition, by the properties of its items. */
export type JsonFormValues = Record<string, unknown>;

/** An item of a form made from a definition. */
export type JsonFormItem = FormItem<JsonFormValues> & {
  help?: string;
  placeholder?: string;
  options?: OptionDefinition[];

  /** The `props` of the definition are properties of the item. */
  [key: string]: unknown;
};

export type FromSchemaOptions = {
  /**
   * The types a definition may use, and the form item type each one stands
   * for: `{ text: 'kit:text' }`. Without it a definition may use the types
   * of the register, by their own names.
   */
  types?: Record<string, string>;

  /** Rules of the application, by the names definitions use them with. */
  rules?: Record<string, Rule>;

  /**
   * Services in addition to GetValues, SetValue, Validate, Trigger, Reset,
   * Touch and Submit.
   */
  services?: Array<IService | (new () => IService)>;

  /** The register whose form item types the form reports. */
  register?: FormItemRegister;

  /** Identifies the form in developer tools; the name of the definition by default. */
  name?: string;
};

/**
 * Thrown for a definition that is not valid. `problems` says what is wrong
 * and where.
 */
export class FormDefinitionError extends Error {
  public readonly problems: DefinitionProblem[];

  constructor(problems: DefinitionProblem[]) {
    super(
      `The form definition is not valid: ${problems
        .map(({ path, message }) => `${path || 'definition'} ${message}`)
        .join('; ')}`
    );
    this.name = 'FormDefinitionError';
    this.problems = problems;
  }
}

type Command = CommandItem<JsonFormValues, JsonFormItem>;

/** The validation of an item: its rules in their order, the first broken one counts. */
const createValidation = (
  { rules = [] }: ItemDefinition,
  known: Record<string, Rule>
): JsonFormItem['validation'] => {
  if (!rules.length) return undefined;

  return async ({ formItem }: Command): Promise<ErrorDetail> => {
    const { value, label } = formItem;

    for (const { rule, value: limit, message } of rules) {
      if (rule !== 'required' && isEmpty(value)) continue;

      const broken = await known[rule](value, { value: limit, label });

      if (broken) return { error: true, errorMessages: [message || broken] };
    }

    return { error: false, errorMessages: [] };
  };
};

/**
 * Creates the controller of a form that is described as data. The
 * definition is checked first; whatever it is, nothing of it is executed.
 * Start the controller as usual, or give this function to `useController`.
 *
 * const controller = await fromSchema(definition, { types: { text: 'app:text' } });
 * await controller.start();
 * @throws {FormDefinitionError} When the definition is not valid
 */
export const fromSchema = async (
  definition: unknown,
  options: FromSchemaOptions = {}
): Promise<FormController<JsonFormValues, JsonFormItem>> => {
  const register = options.register ?? defaultFormItemRegister;
  const types =
    options.types ??
    Object.fromEntries(register.getItemKeys().map((type) => [type, type]));
  const rules = { ...options.rules, ...builtInRules };
  const problems = validateDefinition(definition, {
    types: Object.keys(types),
    rules: Object.keys(options.rules ?? {})
  });

  if (problems.length) {
    throw new FormDefinitionError(problems);
  }

  const { name, title, description, columns, items } =
    definition as FormDefinition;
  const initial = new Map(items.map((item) => [item.property, item.value]));

  /** What the conditions of an item say, for the values as they are. */
  const conditional = (
    item: ItemDefinition,
    valueOf: (property: string) => unknown
  ): Pick<JsonFormItem, 'hidden' | 'disabled'> => ({
    hidden:
      Boolean(item.hidden) ||
      (item.visibleWhen ? !holds(item.visibleWhen, valueOf) : false),
    disabled:
      Boolean(item.disabled) ||
      (item.disabledWhen ? holds(item.disabledWhen, valueOf) : false)
  });

  /** The items whose conditions read the value of a property. */
  const dependents = (property: string): ItemDefinition[] => {
    return items.filter((item) =>
      [item.visibleWhen, item.disabledWhen].some(
        (condition) => condition && propertiesOf(condition).includes(property)
      )
    );
  };

  const form: Form<JsonFormValues, JsonFormItem> = {
    title,
    description,
    columns: columns ?? 1,
    services: [
      GetValues,
      SetValue,
      Validate,
      Trigger,
      Reset,
      Touch,
      Submit,
      ...(options.services ?? [])
    ],
    items: items.map((item) => {
      const affected = dependents(item.property);
      const { property, label, value, help, placeholder, options } = item;

      // What makes an item cannot come from props, whatever the checks let by
      const props = Object.fromEntries(
        Object.entries(item.props ?? {}).filter(
          ([key]) => !(RESERVED_PROPS as readonly string[]).includes(key)
        )
      );

      return {
        ...props,
        property,
        label,
        value,
        help,
        placeholder,
        options,
        type: types[item.type],
        required: item.rules?.some(({ rule }) => rule === 'required'),
        ...conditional(item, (other) => initial.get(other)),
        validation: createValidation(item, rules),

        // Applies the conditions that read the value of this item
        control: affected.length
          ? async ({ formItem, getItem }: Command) =>
              affected.flatMap((dependent) => {
                const current = getItem(dependent.property);

                if (!current) return [];

                const state = conditional(dependent, (other) =>
                  other === property ? formItem.value : getItem(other)?.value
                );

                // An item that is hidden goes back to the value it started
                // with: what was typed into it is not validated any more,
                // so it must not be submitted either
                return [
                  state.hidden && !current.hidden
                    ? {
                        ...current,
                        ...state,
                        value: initial.get(dependent.property),
                        error: false,
                        errorMessages: []
                      }
                    : { ...current, ...state }
                ];
              })
          : undefined
      };
    })
  };

  return FormController.fromForm(form, {
    name: options.name ?? name ?? 'Form',
    register
  });
};
