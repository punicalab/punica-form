import { memo, useCallback, useRef, type ReactNode } from 'react';
import type {} from '@punica/components/react';
import '@punica/components/components/button/button.js';
import '@punica/components/components/formLayout/formLayout.js';
import { useFieldArray, useForm } from '@punica/form-react';
import type { FormRow } from '@punica/form-service';
import { KitItem } from '../types';
import { FieldComponent, FieldComponentProps, Fields } from './FieldList';

// The entity of a row is not known here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = FormRow<any, KitItem<any>>;

type RowProps = Pick<FieldComponentProps, 'components' | 'onError'> & {
  row: Row;
  removeLabel: string;
  disabled: boolean;
  onRemove: (row: Row) => void;
};

/**
 * A row follows its own form: typing into it renders this row and no other
 * one, as long as the `components` and `onError` the form was given stay
 * the same between renders.
 */
const RowView = memo(function RowView({
  row,
  components,
  removeLabel,
  disabled,
  onRemove,
  onError
}: RowProps): ReactNode {
  const form = useForm(row.controller);
  const visible = form.items.filter((item) => !item.hidden).length;

  return (
    <div
      data-kit-row=""
      style={{ display: 'flex', gap: 8, alignItems: 'start' }}
    >
      <punica-form-layout
        // The row class may say so with @FormKit; else its fields share a line
        columns={Number(form.columns ?? Math.min(Math.max(visible, 1), 4))}
        style={{ flex: 1 }}
      >
        <Fields
          controller={row.controller}
          items={form.items}
          components={components}
          onError={onError}
          disabled={disabled}
        />
      </punica-form-layout>
      <punica-button
        type="button"
        variant="text"
        data-kit-action=""
        disabled={disabled}
        onClick={() => onRemove(row)}
      >
        {removeLabel}
      </punica-button>
    </div>
  );
});

/**
 * The rows of a list, each with the fields of its form, a button that
 * removes it and one that adds a row. The rows of a disabled list are
 * disabled as well.
 */
export const Rows: FieldComponent = ({
  item,
  controller,
  components,
  onError
}) => {
  const { rows, append, remove } = useFieldArray(
    controller,
    item.property as never
  );
  // Rows that are being added: they count before they are shown
  const adding = useRef(0);
  const { maxItems } = item;

  const handleRemove = useCallback(
    (row: Row) => {
      remove(row as never).catch(onError);
    },
    [remove, onError]
  );

  const handleAdd = () => {
    if (maxItems !== undefined && rows.length + adding.current >= maxItems) {
      return;
    }

    adding.current++;
    append()
      .catch(onError)
      .finally(() => adding.current--);
  };

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rows.map((row) => (
        <RowView
          key={row.key}
          row={row as Row}
          components={components}
          removeLabel={item.removeLabel ?? 'Remove'}
          disabled={Boolean(item.disabled)}
          onRemove={handleRemove}
          onError={onError}
        />
      ))}
      <div>
        <punica-button
          type="button"
          variant="outlined"
          data-kit-action=""
          disabled={
            Boolean(item.disabled) ||
            (maxItems !== undefined && rows.length >= maxItems)
          }
          onClick={handleAdd}
        >
          {item.addLabel ?? 'Add'}
        </punica-button>
      </div>
    </div>
  );
};
