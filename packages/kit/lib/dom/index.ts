import type { FormController } from '@punica/form';
import {
  fromSchema,
  type JsonFormItem,
  type JsonFormValues,
  type RuleDefinition
} from '@punica/form-json';
import {
  GetValues,
  Reset,
  SetErrors,
  SetValue,
  Touch,
  Trigger,
  Validate
} from '@punica/form-service';

/**
 * A form you draw yourself (your own markup, @punica/components or native
 * controls) whose values, rules and submit are Punica Form's: the engine
 * holds the value of each named control as the person types or chooses; a
 * submit checks the engine's rules and each control's own constraints (in the
 * words the control already uses), shows what is wrong on the control's
 * `punica-field`, focuses the first wrong control, holds the submit buttons
 * while it works, and hands on the values. A control of the form the engine
 * was not given still holds to its own constraints.
 *
 * ```ts
 * import { bindForm } from '@punica/form-kit/dom';
 *
 * const form = bindForm(element, {
 *   fields: { name: nameInput, amount: amountInput },
 *   rules: { amount: [{ rule: 'pattern', value: '^[0-9]+$', message: 'A whole number.' }] },
 *   onSubmit: (values) => save(values),
 *   alert: errorLine
 * });
 * ```
 */
/** A control of a hand-drawn form: a @punica/components field control (or a native one) with a value. */
export type BoundControl = HTMLElement & {
  value?: unknown;
  checked?: boolean;
  disabled?: boolean;
  validity?: ValidityState;
  validationMessage?: string;
  checkValidity?: () => boolean;
  setCustomValidity?: (message: string) => void;
  updateComplete?: Promise<unknown>;
};

export interface BindFormOptions {
  /** The form's controls, by the name each value is handed on under. */
  fields: Record<string, BoundControl>;
  /** Rules of the engine beyond what each control says itself: `{ rule, value?, message? }`. */
  rules?: Record<string, RuleDefinition[]>;
  /** Called with the values when every rule and every control holds. What it throws is said in `alert` (or `failed`). */
  onSubmit: (values: Record<string, unknown>) => unknown;
  /** Called when a submit failed, instead of saying it in `alert`. */
  failed?: (err: unknown) => void;
  /** Where a failure is said. */
  alert?: HTMLElement;
  /** After a submit that went through, put every field back to where the form started. */
  reset?: boolean;
  /**
   * `false` for a form whose buttons decide how it goes (several ways through, Ctrl+Enter): the browser's and the
   * controls' implicit submit (Enter in a field) is let go, and only `submit()` sends it. `true` by default.
   */
  submitOnEnter?: boolean;
}

export interface BoundForm {
  ready: Promise<FormController<JsonFormValues, JsonFormItem>>;
  submit: () => Promise<boolean>;
  values: () => Promise<Record<string, unknown>>;
  set: (name: string, value: unknown) => Promise<void>;
  dispose: () => void;
}

type Item = JsonFormItem & { error?: boolean; errorMessages?: string[] };

const TYPES = {
  text: 'text',
  number: 'number',
  date: 'date',
  select: 'select',
  checkbox: 'checkbox',
  textarea: 'textarea'
};
const CHECKED = /^punica-(checkbox|switch)$/;
const CHOSEN =
  /^punica-(select|listbox|segmented-control|radio-group|selectable-card-group|date-picker|time-picker|month-picker|date-time-input|autocomplete|tokenizer|file-input)$/;
const typeOf = (c: BoundControl): string => {
  const tag = c.localName;
  if (
    CHECKED.test(tag) ||
    (tag === 'input' && (c as HTMLInputElement).type === 'checkbox')
  )
    return 'checkbox';
  if (tag === 'punica-number-input') return 'number';
  if (tag === 'punica-textarea' || tag === 'textarea') return 'textarea';
  if (CHOSEN.test(tag) || tag === 'select') return 'select';
  return 'text';
};
const read = (type: string, c: BoundControl): unknown => {
  if (type === 'checkbox') return c.checked === true;
  const v = c.value;
  if (v === '' || v === null || v === undefined) return undefined;
  if (type === 'number') {
    const n = Number(v);
    return Number.isFinite(n) ? n : v;
  }
  return v;
};

export function bindForm(
  form: HTMLFormElement,
  opts: BindFormOptions
): BoundForm {
  const names = Object.keys(opts.fields);
  const types = new Map(names.map((n) => [n, typeOf(opts.fields[n]!)]));
  const fieldOf = (c: BoundControl) =>
    c.closest('punica-field') as (HTMLElement & { error: string }) | null;
  const said = new WeakMap<BoundControl, string>();
  let controller: FormController<JsonFormValues, JsonFormItem> | undefined;
  let stop: (() => void) | undefined;
  // Every listener of the binding goes with dispose()
  const listening = new AbortController();
  const { signal } = listening;
  let busy = false;
  let failure = '';
  const buttons = () =>
    [
      ...form.querySelectorAll<
        HTMLElement & { disabled: boolean; type?: string }
      >('punica-button, button')
    ].filter((b) => b.type === 'submit');

  const draw = () => {
    if (!controller) return;
    for (const raw of controller.getForm().items as Item[]) {
      const c = opts.fields[String(raw.property)];
      if (!c) continue;
      const message = raw.error ? (raw.errorMessages ?? []).join(' ') : '';
      const field = fieldOf(c);
      if (field && field.error !== message) field.error = message;
      // Only a change: setting it redraws the control, and a checkbox mid-toggle would be put back.
      if (said.get(c) !== message) {
        said.set(c, message);
        c.setCustomValidity?.(message);
      }
    }
    if (opts.alert) {
      opts.alert.textContent = failure;
      opts.alert.hidden = !failure;
    }
    for (const b of buttons()) b.disabled = busy;
  };

  const definition = {
    version: 1,
    items: names.map((n) => {
      const start = read(types.get(n)!, opts.fields[n]!);
      return {
        property: n,
        type: types.get(n),
        label: n,
        ...(start !== undefined ? { value: start } : {}),
        rules: opts.rules?.[n] ?? []
      };
    })
  };

  const ready = fromSchema(definition, { types: TYPES }).then(async (c) => {
    await c.start();
    if (signal.aborted) return c;
    controller = c;
    stop = c.subscribe(() => draw());
    for (const n of names) {
      const control = opts.fields[n]!;
      const type = types.get(n)!;
      const changed = () =>
        void c
          .getService(SetValue)
          .run(n as never, read(type, control) as never);
      // A punica control says it in its own events; a native one in the browser's.
      const own = control.localName.startsWith('punica-');
      control.addEventListener(own ? 'punica-input' : 'input', changed, {
        signal
      });
      control.addEventListener(own ? 'punica-change' : 'change', changed, {
        signal
      });
      control.addEventListener(
        'focusout',
        () =>
          void c
            .getService(Trigger)
            .run(n as never)
            .then(() => c.getService(Touch).run(n as never)),
        { signal }
      );
    }
    return c;
  });
  ready.catch(() => undefined);

  const submit = async (): Promise<boolean> => {
    const c = await ready.catch(() => undefined);
    if (!c || busy) return false;
    busy = true;
    failure = '';
    draw();
    try {
      for (const n of names)
        await c
          .getService(SetValue)
          .run(n as never, read(types.get(n)!, opts.fields[n]!) as never);
      const valid = await c.getService(Validate).run();
      const own: Record<string, string[]> = {};
      for (const n of names) {
        const control = opts.fields[n]!;
        if (control.hidden || control.closest('[hidden]') || control.disabled)
          continue;
        said.set(control, '');
        control.setCustomValidity?.('');
        if (control.validity && !control.validity.valid)
          own[n] = [control.validationMessage || 'Fill this in.'];
      }
      if (Object.keys(own).length) await c.getService(SetErrors).run(own);
      const named = new Set<Element>(Object.values(opts.fields));
      const strays = [...(form.elements as unknown as Iterable<Element>)]
        .filter(
          (e): e is BoundControl =>
            !named.has(e) &&
            typeof (e as BoundControl).checkValidity === 'function' &&
            !(e as BoundControl).closest('[hidden]')
        )
        .filter((e) => !e.checkValidity!());
      if (!valid || Object.keys(own).length || strays.length) {
        if (!Object.keys(own).length && valid)
          void Promise.resolve(strays[0]!.updateComplete).then(() =>
            strays[0]!.focus()
          );
        return false;
      }
      const values = (await c.getService(GetValues).run()) as Record<
        string,
        unknown
      >;
      await opts.onSubmit(Object.fromEntries(names.map((n) => [n, values[n]])));
      if (opts.reset) await c.getService(Reset).run();
      return true;
    } catch (err) {
      if (opts.failed) opts.failed(err);
      else failure = err instanceof Error ? err.message : String(err);
      return false;
    } finally {
      busy = false;
      draw();
      const first = names
        .map((n) => opts.fields[n]!)
        .find(
          (ctl) => fieldOf(ctl)?.error || (ctl.validity && !ctl.validity.valid)
        );
      if (first)
        void Promise.resolve(first.updateComplete).then(() => first.focus());
    }
  };

  const onSubmit = (ev: Event) => {
    ev.preventDefault();
    if (opts.submitOnEnter === false) return;
    void submit();
  };
  form.noValidate = true;
  form.addEventListener('submit', onSubmit, { signal });

  return {
    ready,
    submit,
    values: async () =>
      (await ready).getService(GetValues).run() as Promise<
        Record<string, unknown>
      >,
    set: async (name, value) => {
      const c = await ready;
      const control = opts.fields[name];
      if (control) {
        if (types.get(name) === 'checkbox') control.checked = value === true;
        else control.value = value;
      }
      await c.getService(SetValue).run(name as never, value as never);
    },
    dispose: () => {
      stop?.();
      listening.abort();
    }
  };
}

/** `bindForm`, handing the form back: for a form built inside an expression. */
export function boundForm(
  form: HTMLFormElement,
  opts: BindFormOptions
): HTMLFormElement {
  bindForm(form, opts);
  return form;
}
