import { memo, useRef, useState, type FormEvent } from 'react';
import { defaultFormItemRegister, type FormController } from '@punica/form';
import {
  useFieldArray,
  useForm,
  useFormController,
  useFormState
} from '@punica/form-react';
import {
  Reset,
  SetValue,
  Submit,
  Trigger,
  type FormRow
} from '@punica/form-service';
import type { AppItem } from './formSystem';
import { InvoiceForm, LineForm } from './InvoiceForm';

type Controller = FormController<InvoiceForm, AppItem<InvoiceForm>>;

/** The items of a form, each rendered by the renderer of its type. */
function Items<E extends object>({
  controller,
  items
}: {
  controller: FormController<E, AppItem<E>>;
  items: Array<AppItem<E>>;
}) {
  return items.map((item) => {
    const Renderer = defaultFormItemRegister.getItem(item.type ?? '');

    return (
      Renderer && (
        <Renderer
          key={String(item.property)}
          item={item}
          onChange={(value: string) =>
            controller.getService(SetValue).run(item.property, value)
          }
          onBlur={() => controller.getService(Trigger).run(item.property)}
        />
      )
    );
  });
}

/**
 * A line follows its own form: typing into it renders this line and no
 * other one. `data-renders` counts that for the browser test.
 */
const Line = memo(function Line({
  row,
  onRemove
}: {
  row: FormRow<LineForm, AppItem<LineForm>>;
  onRemove: (row: FormRow<LineForm>) => void;
}) {
  const form = useForm(row.controller);
  const renders = useRef(0);

  return (
    <fieldset
      data-testid="line"
      ref={(element) => {
        element?.setAttribute('data-renders', String(++renders.current));
      }}
      style={{ display: 'flex', gap: 12, alignItems: 'start' }}
    >
      <Items controller={row.controller} items={form.items} />
      <button type="button" onClick={() => onRemove(row)}>
        Remove
      </button>
    </fieldset>
  );
});

function Lines({ controller }: { controller: Controller }) {
  const { rows, append, remove, move } = useFieldArray<
    InvoiceForm,
    AppItem<InvoiceForm>,
    'lines',
    AppItem<LineForm>
  >(controller, 'lines');

  return (
    <>
      {rows.map((row) => (
        <Line key={row.key} row={row} onRemove={remove} />
      ))}
      <button type="button" onClick={() => append()}>
        Add line
      </button>{' '}
      <button
        type="button"
        disabled={rows.length < 2}
        onClick={() => move(rows.length - 1, 0)}
      >
        Last line first
      </button>
    </>
  );
}

/** The error of the list itself; the lines show their own. */
function LinesError({ controller }: { controller: Controller }) {
  const lines = useForm(controller).items.find(
    (item) => item.property === 'lines'
  );

  return (
    <p role="alert" style={{ color: 'crimson' }}>
      {lines?.error && lines.errorMessages?.join(' ')}
    </p>
  );
}

function Status({ controller }: { controller: Controller }) {
  const { dirty, valid } = useFormState(controller);

  return (
    <p data-testid="status">
      {dirty ? 'changed' : 'unchanged'}, {valid ? 'valid' : 'invalid'}
    </p>
  );
}

function InvoiceView({ controller }: { controller: Controller }) {
  const [values, setValues] = useState<InvoiceForm | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setValues(null);
    await controller.getService(Submit).run(setValues);
  };

  const handleReset = async () => {
    await controller.getService(Reset).run();
    setValues(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>Invoice</h2>
      <Customer controller={controller} />
      <Lines controller={controller} />
      <LinesError controller={controller} />
      <Status controller={controller} />
      <button type="submit">Submit</button>{' '}
      <button type="button" onClick={handleReset}>
        Reset
      </button>
      {values && <pre data-testid="values">{JSON.stringify(values)}</pre>}
    </form>
  );
}

/** The items of the invoice itself; the list is rendered by `Lines`. */
function Customer({ controller }: { controller: Controller }) {
  const { items } = useForm(controller);

  return (
    <Items
      controller={controller}
      items={items.filter(({ property }) => property !== 'lines')}
    />
  );
}

/**
 * An invoice with a list of lines. `?lines=1000` starts it with that many.
 */
export function InvoicePanel() {
  const { controller, error } = useFormController<
    InvoiceForm,
    AppItem<InvoiceForm>
  >(
    () => {
      const invoice = new InvoiceForm();
      const count = Number(new URLSearchParams(location.search).get('lines'));

      if (count) {
        invoice.lines = Array.from({ length: count }, (_, index) =>
          Object.assign(new LineForm(), { product: `Product ${index + 1}` })
        );
      }

      return invoice;
    },
    { name: 'invoice' }
  );

  return (
    <section data-testid="invoice">
      {error ? (
        <p>The form could not be started.</p>
      ) : controller ? (
        <InvoiceView controller={controller} />
      ) : (
        <p>Loading…</p>
      )}
    </section>
  );
}
