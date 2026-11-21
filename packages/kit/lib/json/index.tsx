import type { ReactNode } from 'react';
import { CommandService, FormController } from '@punica/form';
import {
  FromSchemaOptions,
  JsonFormValues,
  fromSchema
} from '@punica/form-json';
import { useController } from '@punica/form-react';
import { wrapValidation } from '@punica/form-service';
import { KIT_TYPES } from '../decorators';
import { FormView, type FormViewProps } from '../react';
import { KitItem } from '../types';
import { check } from '../validation';

/**
 * The types a form definition may use with the kit, and the form item type
 * of the kit each one stands for: every type of the kit but the list.
 */
export const KIT_JSON_TYPES: Record<string, string> = Object.fromEntries(
  // The rows of a list are forms of a class, which a definition cannot hold
  Object.entries(KIT_TYPES).filter(([type]) => type !== 'array')
);

type Controller = FormController<JsonFormValues, KitItem<JsonFormValues>>;

/**
 * The rules of the kit a definition sets with `props` (`maxFileSize`,
 * `maxItems`, …), which the rules of a definition do not cover. They run
 * for a value that passed the rules of the definition.
 */
class KitRules {
  public get name(): string {
    return 'kitRules';
  }

  public initialize(
    command: CommandService<JsonFormValues, KitItem<JsonFormValues>>
  ): void {
    wrapValidation(command, (item, validation) => {
      return async (commandItem, context) => {
        const own = await validation?.call(item, commandItem, context);

        if (own?.error) return own;

        const { label, type, messages, accept, value } =
          commandItem.formItem as KitItem<JsonFormValues>;
        const { minDate, maxDate, minItems, maxItems, maxFileSize } =
          commandItem.formItem as KitItem<JsonFormValues>;
        const message = check(
          {
            label,
            type,
            messages,
            accept,
            minDate,
            maxDate,
            minItems,
            maxItems,
            maxFileSize
          },
          value
        );

        return message
          ? { error: true, errorMessages: [message] }
          : (own ?? { error: false, errorMessages: [] });
      };
    });
  }
}

export type JsonFormProps = Omit<
  FormViewProps<JsonFormValues>,
  'controller'
> & {
  /**
   * The form definition, read when the component mounts. It is checked
   * before anything is rendered, so it may come from a language model.
   * Give the component a `key` to show another definition.
   */
  definition: unknown;

  /** Rules, services and types in addition to the kit's. */
  options?: FromSchemaOptions;

  /** Shown while the form is being started. */
  loading?: ReactNode;

  /**
   * Shown when the definition is not valid or the form could not be
   * started; receives what was thrown, a `FormDefinitionError` for a
   * definition that is not valid.
   */
  failed?: (error: unknown) => ReactNode;
};

/**
 * A complete form from a form definition: checks the definition, creates
 * its controller, starts it and renders it with `@punica/components`.
 *
 * <JsonForm definition={definition} onSubmit={(values) => save(values)} />
 */
export function JsonForm({
  definition,
  options,
  loading = null,
  failed = () => <p role="alert">The form could not be shown.</p>,
  ...view
}: JsonFormProps): ReactNode {
  const { controller, error } = useController(
    () =>
      fromSchema(definition, {
        ...options,
        types: { ...KIT_JSON_TYPES, ...options?.types },
        services: [...(options?.services ?? []), KitRules]
        // The items of a definition are the items the kit renders
      }) as unknown as Promise<Controller>
  );

  if (error) return failed(error);
  if (!controller) return loading;

  return <FormView controller={controller} {...view} />;
}
