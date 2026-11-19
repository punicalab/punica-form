import {
  useState,
  type FocusEvent,
  type FormEvent,
  type ReactNode
} from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/button/button.js';
import '@punica/components/components/field/field.js';
import '@punica/components/components/formLayout/formLayout.js';
import { FormController, FormControllerOptions } from '@punica/form';
import { useForm, useFormController } from '@punica/form-react';
import {
  GetValues,
  Reset,
  SetValue,
  Trigger,
  Validate
} from '@punica/form-service';
import { KitItem } from '../types';
import { FieldComponent, SELF_LABELLED, fieldComponents } from './fields';

export type { FieldComponent, FieldComponentProps } from './fields';
export { fieldComponents } from './fields';

type ViewProps<E extends object> = {
  /** Called with the values of a valid form when it is submitted. */
  onSubmit?: (
    values: E,
    controller: FormController<E, KitItem<E>>
  ) => void | Promise<void>;

  /** The text of the submit button, `Submit` by default. */
  submitLabel?: string;

  /** The text of the reset button; there is none without it. */
  resetLabel?: string;

  /** Components for your own form item types, or to replace the kit's. */
  components?: Record<string, FieldComponent>;
};

export type FormViewProps<E extends object> = ViewProps<E> & {
  controller: FormController<E, KitItem<E>>;
};

/**
 * Renders the form of a started controller with `@punica/components`.
 */
export function FormView<E extends object>({
  controller,
  onSubmit,
  submitLabel = 'Submit',
  resetLabel,
  components
}: FormViewProps<E>): ReactNode {
  const form = useForm(controller);
  const [submitting, setSubmitting] = useState(false);
  const fields = { ...fieldComponents, ...components };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      if (await controller.getService(Validate).run()) {
        await onSubmit?.(
          await controller.getService(GetValues).run(),
          controller
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Validates a field when the user leaves it. Not when they leave it for a
  // button of the form: a message that appears or disappears moves the
  // buttons, and the click would miss. Submitting validates everything anyway.
  const handleBlur = (event: FocusEvent, property: keyof E) => {
    const next = event.relatedTarget as Element | null;

    if (!next?.closest('[slot="actions"]')) {
      controller.getService(Trigger).run(property);
    }
  };

  return (
    // The kit validates; the browser's own messages stay out of the way
    <form onSubmit={handleSubmit} noValidate>
      {form.title ? <h2>{String(form.title)}</h2> : null}
      {form.description ? <p>{String(form.description)}</p> : null}

      <punica-form-layout columns={Number(form.columns ?? 1)}>
        {form.items
          .filter((item) => !item.hidden)
          .map((item) => {
            const Field = fields[item.type ?? ''];

            return (
              Field && (
                <punica-field
                  key={String(item.property)}
                  label={
                    SELF_LABELLED.includes(item.type ?? '') ? '' : item.label
                  }
                  help={item.help ?? ''}
                  error={
                    item.error ? (item.errorMessages?.join(' ') ?? '') : ''
                  }
                  required={Boolean(item.required)}
                  onBlur={(event) => handleBlur(event, item.property)}
                  {...(item.span ? { span: item.span } : {})}
                >
                  <Field
                    item={item}
                    onChange={(value) =>
                      controller.getService(SetValue).run(item.property, value)
                    }
                  />
                </punica-field>
              )
            );
          })}

        <div slot="actions" style={{ display: 'flex', gap: 8 }}>
          <punica-button type="submit" loading={submitting}>
            {submitLabel}
          </punica-button>
          {resetLabel ? (
            <punica-button
              type="button"
              variant="outlined"
              onClick={() => controller.getService(Reset).run()}
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
