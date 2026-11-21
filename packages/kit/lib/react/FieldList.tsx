import type { FocusEvent, ReactNode } from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/field/field.js';
import { FormController } from '@punica/form';
import { SetValue, Touch, Trigger } from '@punica/form-service';
import { KIT_TYPES } from '../decorators';
import { KitItem } from '../types';

/**
 * The types whose value changes in one step, by a choice. They are
 * validated when it does: leaving such a field comes before its change, or
 * does not come at all. What is typed is validated when the field is left.
 */
const CHOSEN: string[] = [
  KIT_TYPES.select,
  KIT_TYPES.multiselect,
  KIT_TYPES.radio,
  KIT_TYPES.date,
  KIT_TYPES.file,
  KIT_TYPES.checkbox,
  KIT_TYPES.switch
];

/** The types whose component shows the label itself. */
export const SELF_LABELLED: string[] = [KIT_TYPES.checkbox, KIT_TYPES.switch];

/** What a component that renders a form item type receives. */
export type FieldComponentProps = {
  // The entity is not known to a component that renders any form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: KitItem<any>;

  /** Sets the value of the item. */
  onChange: (value: unknown) => void;

  /** The controller of the form the item belongs to. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  controller: FormController<any, KitItem<any>>;

  /** The components the form is rendered with, by form item type. */
  components: Record<string, FieldComponent>;

  /** Reports what went wrong, as the form does. */
  onError: (error: unknown) => void;
};

export type FieldComponent = (props: FieldComponentProps) => ReactNode;

type FieldsProps<E extends object> = {
  controller: FormController<E, KitItem<E>>;
  items: Array<KitItem<E>>;
  components: Record<string, FieldComponent>;
  onError: (error: unknown) => void;
};

/**
 * The fields of a form: one `punica-field` for every item that is not
 * hidden, around the component of its type.
 */
export function Fields<E extends object>({
  controller,
  items,
  components,
  onError
}: FieldsProps<E>): ReactNode {
  // Validates a field when the user leaves it. Not when they leave it for a
  // button of the form: a message that appears or disappears moves the
  // buttons, and the click would miss. Submitting validates everything anyway.
  const handleBlur = async (event: FocusEvent, property: keyof E) => {
    const next = event.relatedTarget as Element | null;

    const left = event.target as Element;

    // Left a field of a row of this list, which the row looks after, or one
    // of its buttons, which is not what the field holds
    if (
      left.closest?.('punica-field') !== event.currentTarget ||
      left.closest('[data-kit-action]')
    ) {
      return;
    }

    try {
      if (!next?.closest('[slot="actions"], [data-kit-action]')) {
        await controller.getService(Trigger).run(property);
      }

      await controller.getService(Touch).run(property);
    } catch (error) {
      onError(error);
    }
  };

  return items
    .filter((item) => !item.hidden)
    .map((item) => {
      const Field = components[item.type ?? ''];

      return (
        Field && (
          <punica-field
            key={String(item.property)}
            label={SELF_LABELLED.includes(item.type ?? '') ? '' : item.label}
            help={item.help ?? ''}
            error={item.error ? (item.errorMessages?.join(' ') ?? '') : ''}
            required={Boolean(item.required)}
            onBlur={(event) => handleBlur(event, item.property)}
            {...(item.span ? { span: item.span } : {})}
          >
            <Field
              item={item}
              controller={
                controller as unknown as FieldComponentProps['controller']
              }
              components={components}
              onError={onError}
              onChange={(value) =>
                controller
                  .getService(SetValue)
                  .run(item.property, value)
                  .then(() =>
                    CHOSEN.includes(item.type ?? '')
                      ? controller.getService(Trigger).run(item.property)
                      : undefined
                  )
                  .catch(onError)
              }
            />
          </punica-field>
        )
      );
    });
}
