import type { ReactNode } from 'react';
import { FormController } from '@punica/form';
import {
  FromSchemaOptions,
  JsonFormValues,
  fromSchema
} from '@punica/form-json';
import { useController } from '@punica/form-react';
import { KIT_TYPES } from '../decorators';
import { FormView, type FormViewProps } from '../react';
import { KitItem } from '../types';

/**
 * The types a form definition may use with the kit, and the form item type
 * of the kit each one stands for: every type of the kit but the list.
 */
export const KIT_JSON_TYPES: Record<string, string> = Object.fromEntries(
  // The rows of a list are forms of a class, which a definition cannot hold
  Object.entries(KIT_TYPES).filter(([type]) => type !== 'array')
);

type Controller = FormController<JsonFormValues, KitItem<JsonFormValues>>;

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
        types: { ...KIT_JSON_TYPES, ...options?.types }
        // The items of a definition are the items the kit renders
      }) as unknown as Promise<Controller>
  );

  if (error) return failed(error);
  if (!controller) return loading;

  return <FormView controller={controller} {...view} />;
}
