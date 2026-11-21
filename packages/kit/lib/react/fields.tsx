import { useEffect, useRef, useState } from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/checkbox/checkbox.js';
import '@punica/components/components/datePicker/datePicker.js';
import '@punica/components/components/fileInput/fileInput.js';
import '@punica/components/components/input/input.js';
import '@punica/components/components/radio/radio.js';
import '@punica/components/components/radio/radioGroup.js';
import '@punica/components/components/select/option.js';
import '@punica/components/components/select/select.js';
import '@punica/components/components/switch/switch.js';
import '@punica/components/components/textarea/textarea.js';
import { KIT_TYPES } from '../decorators';
import { Option, Options } from '../types';
import { FieldComponent } from './FieldList';
import { Rows } from './Rows';

const optionOf = (option: Option) => {
  return typeof option === 'string' ? { value: option, label: option } : option;
};

const Text: FieldComponent = ({ item, onChange }) => (
  <punica-input
    type={item.inputType ?? 'text'}
    value={item.value ?? ''}
    placeholder={item.placeholder}
    autocomplete={item.autocomplete}
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

/** The lists that were loaded, or are being loaded, by their function. */
const loads = new WeakMap<object, Promise<Option[]>>();

/**
 * The choices of a field. A function is called once, also when it is the
 * one of several fields; while it runs the field is loading.
 */
const useOptions = (
  source: Options | undefined,
  onError: (error: unknown) => void
): { options: Array<{ value: string; label: string }>; loading: boolean } => {
  const [loaded, setLoaded] = useState<{
    source: unknown;
    options: Option[];
  }>();

  useEffect(() => {
    if (typeof source !== 'function') return undefined;

    let current = true;
    const load = loads.get(source) ?? source();

    loads.set(source, load);
    load.then(
      (options) => current && setLoaded({ source, options }),
      (error) => {
        // The next field that needs the list asks again
        loads.delete(source);

        if (current) {
          setLoaded({ source, options: [] });
          onError(error);
        }
      }
    );

    return () => {
      current = false;
    };
    // The function that reports errors is a new one on every render: only
    // another list is a reason to load again
  }, [source]);

  if (typeof source !== 'function') {
    return { options: (source ?? []).map(optionOf), loading: false };
  }

  return loaded?.source === source
    ? { options: loaded.options.map(optionOf), loading: false }
    : { options: [], loading: true };
};

const Select: FieldComponent = ({ item, onChange, onError }) => {
  const { options, loading } = useOptions(item.options, onError);
  const multiple = item.type === KIT_TYPES.multiselect;

  return (
    <punica-select
      multiple={multiple}
      // The element takes an array with `multiple`. While the choices are
      // loaded it is empty, or it would show a value it has no text for
      value={
        ((loading ? undefined : item.value) ?? (multiple ? [] : '')) as string
      }
      placeholder={
        loading ? (item.loadingText ?? 'Loading…') : item.placeholder
      }
      disabled={item.disabled || loading}
      full-width
      onpunica-change={(event) => onChange(event.detail.value)}
    >
      {options.map(({ value, label }) => (
        <punica-option key={value} value={value}>
          {label}
        </punica-option>
      ))}
    </punica-select>
  );
};

const RadioGroup: FieldComponent = ({ item, onChange, onError }) => {
  const { options, loading } = useOptions(item.options, onError);

  return loading ? (
    <span>{item.loadingText ?? 'Loading…'}</span>
  ) : (
    <punica-radio-group
      label={item.label}
      value={item.value ?? ''}
      orientation={item.orientation ?? 'vertical'}
      disabled={item.disabled}
      onpunica-change={(event) => onChange(event.detail.value)}
    >
      {options.map(({ value, label }) => (
        <punica-radio key={value} value={value}>
          {label}
        </punica-radio>
      ))}
    </punica-radio-group>
  );
};

/** What the value of a date field is while what was typed is not a date. */
const NOT_A_DATE = 'invalid';

const isDate = (value: unknown): value is string => {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
};

const DatePicker: FieldComponent = ({ item, onChange }) => {
  const bad = item.value !== undefined && !isDate(item.value);
  const wasBad = useRef(bad);
  const [shown, setShown] = useState(0);

  // The form was reset while the field held a text that is no date: the
  // element only forgets that text when it is created anew
  useEffect(() => {
    if (wasBad.current && item.value === undefined)
      setShown((count) => count + 1);

    wasBad.current = bad;
  }, [bad, item.value]);

  return (
    <punica-date-picker
      key={shown}
      // null empties the field; the value is `yyyy-mm-dd`
      value={(isDate(item.value) ? item.value : null) as string}
      min={item.minDate}
      max={item.maxDate}
      locale={item.locale}
      placeholder={item.placeholder}
      disabled={item.disabled}
      full-width
      onpunica-change={(event) => onChange(event.detail.value ?? undefined)}
      onBlur={(event) => {
        // A text that is no date leaves the element without a value and
        // without a change: the form has to know, or it would submit nothing
        const { validity } = event.currentTarget as unknown as {
          validity?: ValidityState;
        };

        if (validity?.badInput) onChange(NOT_A_DATE);
      }}
    />
  );
};

const Password: FieldComponent = ({ item, onChange }) => (
  <punica-input
    type="password"
    value={item.value ?? ''}
    placeholder={item.placeholder}
    autocomplete={item.autocomplete}
    disabled={item.disabled}
    full-width
    onpunica-input={(event) => onChange(event.detail.value)}
  />
);

const filesOf = (value: unknown): unknown[] => {
  return Array.isArray(value) ? value : value ? [value] : [];
};

const FileInput: FieldComponent = ({ item, onChange }) => (
  <punica-file-input
    label={item.label}
    accept={item.accept}
    multiple={item.multiple}
    disabled={item.disabled}
    files={filesOf(item.value)}
    onpunica-change={({ detail }) =>
      onChange(item.multiple ? [...detail.files] : detail.files[0])
    }
  />
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
  [KIT_TYPES.switch]: Switch,
  [KIT_TYPES.radio]: RadioGroup,
  [KIT_TYPES.date]: DatePicker,
  [KIT_TYPES.multiselect]: Select,
  [KIT_TYPES.password]: Password,
  [KIT_TYPES.file]: FileInput,
  [KIT_TYPES.array]: Rows
};
