import type { ReactNode } from 'react';
import {
  defineFormItem,
  defineFormProperty,
  getFormProperty,
  type Form,
  type FormItem,
  type IReader
} from '@punica/form';

/**
 * The form system of this application: its item type, its decorators, its
 * reader and its components. Punica Form provides none of these.
 */

export type AppItem<E> = FormItem<E> & { options?: string[] };

export type RenderProps = {
  item: AppItem<unknown>;
  onChange: (value: string) => void;
  onBlur: () => void;
};

const TITLE = 'example:title';

export const Title = defineFormProperty<string>(TITLE);

export class Reader<E extends object, F extends AppItem<E>> implements IReader<
  E,
  F
> {
  public read(entity: E, form: Form<E, F>): void {
    form.title = getFormProperty<string>(entity, TITLE);
  }
}

function Field({
  item,
  children
}: {
  item: AppItem<unknown>;
  children: ReactNode;
}) {
  return (
    <label style={{ display: 'block', marginBottom: 12 }}>
      {item.label}
      {item.required && ' *'}
      <br />
      {children}
      <span role="alert" style={{ color: 'crimson', marginLeft: 8 }}>
        {item.error && item.errorMessages?.join(' ')}
      </span>
    </label>
  );
}

function Text({ item, onChange, onBlur }: RenderProps) {
  return (
    <Field item={item}>
      <input
        name={String(item.property)}
        value={item.value ?? ''}
        disabled={item.disabled}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      />
    </Field>
  );
}

function Select({ item, onChange, onBlur }: RenderProps) {
  return (
    <Field item={item}>
      <select
        name={String(item.property)}
        value={item.value ?? ''}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
      >
        <option value="">Choose…</option>
        {item.options?.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Field>
  );
}

// The entity is not known where a decorator is defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Props = Omit<AppItem<any>, 'property'>;

export const FormItemText = defineFormItem<Props>('example:text', Text);
export const FormItemSelect = defineFormItem<Props>('example:select', Select);
