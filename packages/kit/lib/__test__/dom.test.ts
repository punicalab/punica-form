import { bindForm, boundForm } from '../dom';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

/** A form drawn by hand: a field around each control, an alert, a submit button. */
const drawn = () => {
  document.body.innerHTML = `
    <form>
      <punica-field><input name="name" required></punica-field>
      <punica-field><input name="amount"></punica-field>
      <label><input name="agree" type="checkbox"> Agree</label>
      <select name="kind"><option value="a">A</option><option value="b">B</option></select>
      <p class="alert" hidden></p>
      <button type="submit">Save</button>
    </form>`;
  const form = document.querySelector('form')!;
  const q = <T extends Element>(s: string) => form.querySelector(s) as T;

  return {
    form,
    name: q<HTMLInputElement>('[name=name]'),
    amount: q<HTMLInputElement>('[name=amount]'),
    agree: q<HTMLInputElement>('[name=agree]'),
    kind: q<HTMLSelectElement>('[name=kind]'),
    alert: q<HTMLElement>('.alert'),
    go: q<HTMLButtonElement>('button')
  };
};

const type = (control: HTMLInputElement, value: string) => {
  control.value = value;
  control.dispatchEvent(new Event('input', { bubbles: true }));
};

const fieldOf = (control: Element) =>
  control.closest('punica-field') as HTMLElement & { error?: string };

afterEach(() => (document.body.innerHTML = ''));

describe('bindForm', () => {
  it('hands on the values the engine holds, as typed and chosen', async () => {
    const f = drawn();
    const sent: Record<string, unknown>[] = [];
    const form = bindForm(f.form, {
      fields: { name: f.name, amount: f.amount, agree: f.agree, kind: f.kind },
      onSubmit: (values) => void sent.push(values)
    });

    await form.ready;
    type(f.name, 'Acme');
    f.agree.checked = true;
    f.agree.dispatchEvent(new Event('change', { bubbles: true }));
    f.kind.value = 'b';
    f.kind.dispatchEvent(new Event('change', { bubbles: true }));

    expect(await form.submit()).toBe(true);
    expect(sent).toEqual([
      { name: 'Acme', amount: undefined, agree: true, kind: 'b' }
    ]);
    expect(await form.values()).toMatchObject({ name: 'Acme', agree: true });
  });

  it("stops on a control's own constraint, in its words, on its field, and focuses it", async () => {
    const f = drawn();
    let sent = 0;
    const form = bindForm(f.form, {
      fields: { name: f.name, amount: f.amount },
      onSubmit: () => void sent++
    });

    await form.ready;
    f.form.requestSubmit();
    await settle();
    await settle();

    expect(sent).toBe(0);
    expect(fieldOf(f.name).error).toBe(
      f.name.validationMessage || 'Fill this in.'
    );
    expect(fieldOf(f.name).error).not.toBe('');
    expect(document.activeElement).toBe(f.name);

    type(f.name, 'Acme');
    expect(await form.submit()).toBe(true);
    expect(fieldOf(f.name).error).toBe('');
    expect(sent).toBe(1);
  });

  it("checks the engine's rules, with their messages", async () => {
    const f = drawn();
    const form = bindForm(f.form, {
      fields: { name: f.name, amount: f.amount },
      rules: {
        amount: [
          {
            rule: 'pattern',
            value: '^[0-9]+(\\.[0-9]{1,2})?$',
            message: 'An amount, like 1210.00.'
          }
        ]
      },
      onSubmit: () => undefined
    });

    await form.ready;
    type(f.name, 'Acme');
    type(f.amount, 'twelve');

    expect(await form.submit()).toBe(false);
    expect(fieldOf(f.amount).error).toBe('An amount, like 1210.00.');
    expect(f.amount.validationMessage).toBe('An amount, like 1210.00.');
  });

  it('says a refusal that names no field in the alert, and holds the button while it works', async () => {
    const f = drawn();
    let release!: () => void;
    const form = bindForm(f.form, {
      fields: { name: f.name },
      alert: f.alert,
      onSubmit: () =>
        new Promise<void>(
          (_, no) => (release = () => no(new Error('The firm is archived.')))
        )
    });

    await form.ready;
    type(f.name, 'Acme');

    const done = form.submit();

    await settle();
    await settle();
    expect(f.go.disabled).toBe(true);
    release();
    expect(await done).toBe(false);
    expect(f.alert.hidden).toBe(false);
    expect(f.alert.textContent).toBe('The firm is archived.');
    expect(f.go.disabled).toBe(false);
  });

  it('gives a failure to `failed` instead, when there is one', async () => {
    const f = drawn();
    const failures: unknown[] = [];
    const form = bindForm(f.form, {
      fields: { name: f.name },
      alert: f.alert,
      failed: (error) => void failures.push(error),
      onSubmit: () => {
        throw new Error('nope');
      }
    });

    await form.ready;
    type(f.name, 'Acme');

    expect(await form.submit()).toBe(false);
    expect(failures).toHaveLength(1);
    expect(f.alert.hidden).toBe(true);
  });

  it('writes a value into the engine and its control', async () => {
    const f = drawn();
    const sent: Record<string, unknown>[] = [];
    const form = bindForm(f.form, {
      fields: { name: f.name, agree: f.agree },
      onSubmit: (values) => void sent.push(values)
    });

    await form.ready;
    await form.set('name', '0001');
    await form.set('agree', true);

    expect(f.name.value).toBe('0001');
    expect(f.agree.checked).toBe(true);
    expect(await form.submit()).toBe(true);
    expect(sent).toEqual([{ name: '0001', agree: true }]);
  });

  it('puts the fields back after a submit with `reset`', async () => {
    const f = drawn();
    const form = bindForm(f.form, {
      fields: { name: f.name },
      reset: true,
      onSubmit: () => undefined
    });

    await form.ready;
    type(f.name, 'Acme');
    expect(await form.submit()).toBe(true);
    expect((await form.values()).name).toBeUndefined();
  });

  it('lets Enter go with `submitOnEnter: false`: only submit() sends', async () => {
    const f = drawn();
    let sent = 0;
    const form = bindForm(f.form, {
      fields: { name: f.name },
      submitOnEnter: false,
      onSubmit: () => void sent++
    });

    await form.ready;
    type(f.name, 'Acme');
    f.form.requestSubmit();
    await settle();
    expect(sent).toBe(0);
    expect(await form.submit()).toBe(true);
    expect(sent).toBe(1);
  });

  it('holds a control it was not given to its own constraint', async () => {
    const f = drawn();
    let sent = 0;
    const form = bindForm(f.form, {
      fields: { amount: f.amount },
      onSubmit: () => void sent++
    });

    await form.ready;
    expect(await form.submit()).toBe(false);
    expect(sent).toBe(0);
    type(f.name, 'x');
    expect(await form.submit()).toBe(true);
  });

  it('stops listening after dispose', async () => {
    const f = drawn();
    let sent = 0;
    const form = bindForm(f.form, {
      fields: { name: f.name },
      onSubmit: () => void sent++
    });

    await form.ready;
    form.dispose();
    type(f.name, 'Acme');
    f.form.requestSubmit();
    await settle();
    expect(sent).toBe(0);
    expect((await form.values()).name).toBeUndefined();
  });

  it('boundForm hands the form back, bound', async () => {
    const f = drawn();
    let sent = 0;

    expect(boundForm(f.form, { fields: {}, onSubmit: () => void sent++ })).toBe(
      f.form
    );
    type(f.name, 'Acme');
    f.form.requestSubmit();
    await settle();
    await settle();
    await settle();
    expect(sent).toBe(1);
  });
});
