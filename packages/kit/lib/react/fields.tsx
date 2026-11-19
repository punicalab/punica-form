import type { ReactNode } from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/checkbox/checkbox.js';
import '@punica/components/components/input/input.js';
import '@punica/components/components/select/option.js';
import '@punica/components/components/select/select.js';
import '@punica/components/components/switch/switch.js';
import '@punica/components/components/textarea/textarea.js';
import { KIT_TYPES } from '../decorators';
import { KitItem, Option } from '../types';

/** What a component that renders a form item type receives. */
export type FieldComponentProps = {
  // The entity is not known to a component that renders any form
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item: KitItem<any>;

  /** Sets the value of the item. */
  onChange: (value: unknown) => void;
};

export type FieldComponent = (props: FieldComponentProps) => ReactNode;

const optionOf = (option: Option) => {
  return typeof option === 'string' ? { value: option, label: option } : option;
};

const Text: FieldComponent = ({ item, onChange }) => (
  <punica-input
    type={item.inputType ?? 'text'}
    value={item.value ?? ''}
    placeholder={item.placeholder}
    disabled={item.disabled}
    full-width
    onpunica-input={(event) => onChange(event.detail.value)}
  />
);

const Number: FieldComponent = ({ item, onChange }) => (
  <punica-input
    type="number"
    value={item.value ?? ''}
    placeholder={item.placeholder}
    disabled={item.disabled}
    full-width
    onpunica-input={({ detail }) =>
      onChange(
        detail.value === '' ? undefined : globalThis.Number(detail.value)
      )
    }
  />
);

const TextArea: FieldComponent = ({ item, onChange }) => (
  <punica-textarea
    value={item.value ?? ''}
    placeholder={item.placeholder}
    rows={item.rows}
    disabled={item.disabled}
    full-width
    onpunica-input={(event) => onChange(event.detail.value)}
  />
);

const Select: FieldComponent = ({ item, onChange }) => (
  <punica-select
    value={item.value ?? ''}
    placeholder={item.placeholder}
    disabled={item.disabled}
    full-width
    onpunica-change={(event) => onChange(event.detail.value)}
  >
    {item.options?.map(optionOf).map(({ value, label }) => (
      <punica-option key={value} value={value}>
        {label}
      </punica-option>
    ))}
  </punica-select>
);

const Checkbox: FieldComponent = ({ item, onChange }) => (
  <punica-checkbox
    checked={Boolean(item.value)}
    disabled={item.disabled}
    onpunica-change={(event) => onChange(event.detail.checked)}
  >
    {item.label}
  </punica-checkbox>
);

const Switch: FieldComponent = ({ item, onChange }) => (
  <punica-switch
    checked={Boolean(item.value)}
    disabled={item.disabled}
    onpunica-change={(event) => onChange(event.detail.checked)}
  >
    {item.label}
  </punica-switch>
);

/** The component of every form item type of the kit. */
export const fieldComponents: Record<string, FieldComponent> = {
  [KIT_TYPES.text]: Text,
  [KIT_TYPES.number]: Number,
  [KIT_TYPES.textarea]: TextArea,
  [KIT_TYPES.select]: Select,
  [KIT_TYPES.checkbox]: Checkbox,
  [KIT_TYPES.switch]: Switch
};

/** The types whose component shows the label itself. */
export const SELF_LABELLED: string[] = [KIT_TYPES.checkbox, KIT_TYPES.switch];
