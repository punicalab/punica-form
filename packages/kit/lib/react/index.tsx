import { useMemo, type FormEvent, type ReactNode } from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/button/button.js';
import '@punica/components/components/formLayout/formLayout.js';
import { FormController, FormControllerOptions } from '@punica/form';
import { useForm, useFormController } from '@punica/form-react';
import { Reset, Submit } from '@punica/form-service';
import { KitItem } from '../types';
import { FieldComponent, Fields } from './FieldList';
import { fieldComponents } from './fields';

export type { FieldComponent, FieldComponentProps } from './FieldList';
export { fieldComponents } from './fields';

type ViewProps<E extends object> = {
  /** Called with the values of a valid form when it is submitted. */
  onSubmit?: (
    values: E,
    controller: FormController<E, KitItem<E>>
  ) => void | Promise<void>;

  /**
   * Called with what a validation, a control function or `onSubmit` threw.
   * Without it the error is logged to the console. What a submit throws is
   * also shown above the fields.
   */
  onError?: (error: unknown) => void;

  /** The text of the submit button, `Submit` by default. */
  submitLabel?: string;

  /** The text of the reset button; there is none without it. */
  resetLabel?: string;

  /** Components for your own form item types, or to replace the kit's. */
  components?: Record<string, FieldComponent>;
};

export type FormViewProps<E extends object> = ViewProps<E> & {
  /** A started controller of a `@FormKit` class, which brings the services the view needs. */
  controller: FormController<E, KitItem<E>>;
};

/** What the form does with an error when it is given no `onError`. */
const logError = (error: unknown): void => console.error(error);

/**
 * Renders the form of a started controller with `@punica/components`.
 */
export function FormView<E extends object>({
  controller,
  onSubmit,
  onError = logError,
  submitLabel = 'Submit',
  resetLabel,
  components
}: FormViewProps<E>): ReactNode {
  const form = useForm(controller);
  // The same object between renders, so the rows of a list are not
  // rendered again when another one changes
  const fields = useMemo(
    () => ({ ...fieldComponents, ...components }),
    [components]
  );

  // The Submit service validates, keeps a second submit out (Enter in a
  // field while the button is loading) and records what the handler throws
  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const report = (error: unknown) => onError(error);
    const remove = controller.on('SUBMIT_ERROR', report);

    try {
      await controller
        .getService(Submit)
        .run((values) => onSubmit?.(values, controller));
    } catch (error) {
      onError(error);
    } finally {
      remove();
    }
  };

  return (
    // The kit validates; the browser's own messages stay out of the way
    <form onSubmit={handleSubmit} noValidate>
      {form.title ? <h2>{String(form.title)}</h2> : null}
      {form.description ? <p>{String(form.description)}</p> : null}
      {form.state?.errors.length ? (
        <p role="alert" style={{ color: 'var(--punica-color-error)' }}>
          {form.state.errors.join(' ')}
        </p>
      ) : null}

      <punica-form-layout columns={Number(form.columns ?? 1)}>
        <Fields
          controller={controller}
          items={form.items}
          components={fields}
          onError={onError}
        />

        <div slot="actions" style={{ display: 'flex', gap: 8 }}>
          <punica-button
            type="submit"
            loading={Boolean(form.state?.submitting)}
          >
            {submitLabel}
          </punica-button>
          {resetLabel ? (
            <punica-button
              type="button"
              variant="outlined"
              onClick={() => controller.getService(Reset).run().catch(onError)}
            >
              {resetLabel}
            </punica-button>
          ) : null}
        </div>
      </punica-form-layout>
    </form>
  );
}

export type KitFormProps<E extends object> = ViewProps<E> & {
  /** Returns the entity of the form, for example `() => new UserForm()`. */
  entity: () => E;

  /** Options of the controller, read when the component mounts. */
  options?: FormControllerOptions;

  /** Shown while the form is being started. */
  loading?: ReactNode;

  /** Shown when the form could not be started; receives what was thrown. */
  failed?: (error: unknown) => ReactNode;
};

/**
 * A complete form: creates the controller of the entity, starts it and
 * renders it.
 */
export function KitForm<E extends object>({
  entity,
  options,
  loading = null,
  failed = () => <p role="alert">The form could not be started.</p>,
  ...view
}: KitFormProps<E>): ReactNode {
  const { controller, error } = useFormController<E, KitItem<E>>(
    entity,
    options
  );

  if (error) return failed(error);
  if (!controller) return loading;

  return <FormView controller={controller} {...view} />;
}
