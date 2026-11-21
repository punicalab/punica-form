import {
  CommandItem,
  Form,
  FormController,
  FormItem,
  disableDevTools,
  enableDevTools
} from '@punica/form';
import {
  ClearError,
  ClearErrors,
  FormValidation,
  GetValues,
  Reset,
  ResetItem,
  SetValue,
  Store,
  StoreCommand,
  Submit,
  Touch,
  Trigger,
  Validate,
  addFormValidation
} from '..';

type Entity = { name: string; age: number; address: { city: string } };
type Item = FormItem<Entity>;

const required: Item['validation'] = async ({ formItem }) => ({
  error: !formItem.value,
  errorMessages: formItem.value ? [] : ['is required']
});

const createForm = (): Form<Entity, Item> => ({
  items: [
    {
      property: 'name',
      label: 'Name',
      value: 'a',
      validation: required,
      // Mirrors the length of the name into the age item
      control: async ({ formItem, getItem }) => [
        { ...(getItem('age') as Item), value: formItem.value.length }
      ]
    },
    { property: 'age', label: 'Age', value: 1 },
    { property: 'address', label: 'City', path: 'address/city', value: 'x' }
  ],
  services: [
    GetValues,
    SetValue,
    Validate,
    Trigger,
    Reset,
    ResetItem,
    ClearError,
    ClearErrors,
    Store,
    Touch,
    Submit
  ]
});

/** A promise and the function that resolves it. */
const gate = () => {
  let open: () => void = () => undefined;
  const closed = new Promise<void>((resolve) => (open = resolve));

  return { closed, open };
};

describe('services', () => {
  let controller: FormController<Entity, Item>;

  const values = () => controller.getForm().items.map((item) => item.value);

  beforeEach(async () => {
    controller = await FormController.fromForm(createForm());
    await controller.start();
  });

  test('a reset is applied at once: what is set after it stays', async () => {
    const reset = controller.getService(Reset).run();
    const cleared = controller.getService(ClearErrors).run();
    const set = controller.getService(SetValue).run('age', 7);

    await Promise.all([reset, cleared, set]);

    expect(values()).toEqual(['a', 7, 'x']);
  });

  test('SetValue sets the value and writes the items its control returns', async () => {
    const listener = jest.fn();

    controller.on('UPDATE_ITEM', listener);
    await controller.getService(SetValue).run('name', 'abc');

    expect(values()).toEqual(['abc', 3, 'x']);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(
      listener.mock.calls[0][0].map((item: Item) => item.property)
    ).toEqual(['name', 'age']);
  });

  test('services reject for an unknown property', async () => {
    const unknown = 'unknown' as keyof Entity;

    for (const run of [
      () => controller.getService(SetValue).run(unknown, 1),
      () => controller.getService(Trigger).run(unknown),
      () => controller.getService(ResetItem).run(unknown),
      () => controller.getService(ClearError).run(unknown)
    ]) {
      await expect(run()).rejects.toThrow('Item not found: unknown');
    }
  });

  test('Validate validates every item and reports the result', async () => {
    expect(await controller.getService(Validate).run()).toBe(true);

    await controller.getService(SetValue).run('name', '');

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(controller.getForm().items[0]).toMatchObject({
      error: true,
      errorMessages: ['is required']
    });
  });

  test('Validate rejects when a validation function throws', async () => {
    const form = createForm();

    form.items[0].validation = async () => {
      throw new Error('validation failed');
    };

    const failing = await FormController.fromForm(form);

    await failing.start();

    await expect(failing.getService(Validate).run()).rejects.toThrow(
      'validation failed'
    );
  });

  test('a value set while the form is validated is kept', async () => {
    const form = createForm();
    let release: () => void = () => undefined;

    form.items[0].validation = async (command) => {
      await new Promise<void>((resolve) => (release = resolve));

      return (required as NonNullable<Item['validation']>)(command);
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await slow.getService(SetValue).run('age', 42);
    release();
    await validation;

    expect(slow.getForm().items[1].value).toEqual(42);
  });

  test('a value set after its item was validated, while others still are, is kept', async () => {
    const form = createForm();
    const { closed, open } = gate();

    // name is validated first and at once, age is still being validated
    form.items[1].validation = async () => {
      await closed;

      return { error: false };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await Promise.resolve();
    await slow.getService(SetValue).run('address', 'typed');
    open();
    await validation;

    expect(slow.getForm().items[2].value).toEqual('typed');
  });

  test('a slow validation does not write its result onto a newer value', async () => {
    const form = createForm();
    const { closed, open } = gate();

    // Only the validation of the empty value is slow
    form.items[0].validation = async (command) => {
      if (!command.formItem.value) await closed;

      return (required as NonNullable<Item['validation']>)(command);
    };

    const slow = await FormController.fromForm(form);

    await slow.start();
    await slow.getService(SetValue).run('name', '');

    const stale = slow.getService(Trigger).run('name');

    await slow.getService(SetValue).run('name', 'good');
    await slow.getService(Trigger).run('name');
    open();
    await stale;

    expect(slow.getForm().items[0]).toMatchObject({
      value: 'good',
      error: false
    });
  });

  test('a reset drops the result of a validation that is still running', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].validation = async () => {
      await closed;

      return { error: true, errorMessages: ['late'] };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const whole = slow.getService(Trigger).run('name');

    await slow.getService(Reset).run();

    const single = slow.getService(Trigger).run('name');

    await slow.getService(ResetItem).run('name');
    open();
    await Promise.all([whole, single]);

    expect(slow.getForm().items[0].error).toBeFalsy();
  });

  test('a disabled item is not validated', async () => {
    const form = createForm();

    form.items[0] = { ...form.items[0], value: '', disabled: true };

    const disabled = await FormController.fromForm(form);

    await disabled.start();

    expect(await disabled.getService(Validate).run()).toBe(true);
    expect(disabled.getForm().items[0].error).toBeFalsy();
  });

  test('a slow control function does not revert a newer value', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = async ({ formItem }) => {
      if (formItem.value === 'x') await closed;

      return [{ ...formItem, label: `Name (${formItem.value})` }];
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const first = slow.getService(SetValue).run('name', 'x');

    await slow.getService(SetValue).run('name', 'xy');
    open();
    await first;

    expect(slow.getForm().items[0]).toMatchObject({
      value: 'xy',
      label: 'Name (xy)'
    });
  });

  test('a reset drops the result of a control function that is still running', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = async ({ formItem }) => {
      await closed;

      return [formItem];
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const pending = slow.getService(SetValue).run('name', 'x');

    await slow.getService(Reset).run();
    open();
    await pending;

    expect(slow.getForm().items[0].value).toEqual('a');
  });

  test('forms created with service classes do not share their services', async () => {
    const first = await FormController.fromForm(createForm());
    const second = await FormController.fromForm(createForm());

    await first.start();
    await second.start();
    await first.getService(SetValue).run('age', 42);

    expect(first.getForm().items[1].value).toEqual(42);
    expect(second.getForm().items[1].value).toEqual(1);
  });

  test('GetValues only runs for developer tools when they are enabled', async () => {
    const run = jest.spyOn(GetValues.prototype, 'run');

    await controller.getService(SetValue).run('name', 'abc');

    expect(run).not.toHaveBeenCalled();
    run.mockRestore();
  });

  test('Trigger validates one item; ClearError and ClearErrors clear the result', async () => {
    await controller.getService(SetValue).run('name', '');
    await controller.getService(Trigger).run('name');

    expect(controller.getForm().items[0].error).toBe(true);

    await controller.getService(ClearError).run('name');

    expect(controller.getForm().items[0]).toMatchObject({
      error: false,
      errorMessages: []
    });

    await controller.getService(Trigger).run('name');
    await controller.getService(ClearErrors).run();

    expect(controller.getForm().items.some((item) => item.error)).toBe(false);
  });

  test('Reset restores the initial items, repeatedly, and fires RESET', async () => {
    const listener = jest.fn();

    controller.on('RESET', listener);

    for (const value of ['abc', 'abcd']) {
      await controller.getService(SetValue).run('name', value);
      await controller.getService(Reset).run();

      expect(values()).toEqual(['a', 1, 'x']);
    }

    expect(listener).toHaveBeenLastCalledWith(controller.getForm());
  });

  test('ResetItem restores a single item', async () => {
    await controller.getService(SetValue).run('name', 'abc');
    await controller.getService(ResetItem).run('name');

    expect(values()).toEqual(['a', 3, 'x']);
  });

  test('GetValues fills a copy of the entity, nested values by their path', async () => {
    class User {
      public name = 'a';
      public address = { city: 'x' };
    }

    const entity = new User();
    const withEntity = await FormController.fromForm<User>({
      items: [
        { property: 'name', label: 'Name', value: 'b' },
        { property: 'address', label: 'City', path: 'address/city', value: 'y' }
      ],
      services: [GetValues]
    });

    await withEntity.start();

    // fromForm has no entity: the values are written to an empty object
    expect(await withEntity.getService(GetValues).run()).toEqual({
      name: 'b',
      address: { city: 'y' }
    });
    expect(entity.address.city).toEqual('x');
  });

  test('developer tools receive the entity as GetValues returns it', async () => {
    const postMessage = jest.spyOn(window, 'postMessage').mockImplementation();

    enableDevTools();
    await controller.getService(SetValue).run('name', 'abc');
    await Promise.resolve();
    disableDevTools();

    const entities = postMessage.mock.calls
      .map(([message]) => message)
      .filter((message) => message.type === 'ENTITY');

    expect(JSON.parse(entities[entities.length - 1].data)).toMatchObject({
      name: 'abc',
      age: 3
    });
    expect(
      postMessage.mock.calls.some(([message]) => message.formItemKey === 'name')
    ).toBe(true);

    postMessage.mockRestore();
  });

  test('Store shares values between the functions of the items', async () => {
    const form = createForm();

    form.items[0].validation = async (command) => {
      const { writeStoreItem, readStoreItem } = command as CommandItem<
        Entity,
        Item,
        StoreCommand
      >;

      writeStoreItem('calls', ((readStoreItem('calls') as number) ?? 0) + 1);

      return { error: readStoreItem('calls') !== 2 };
    };

    const stored = await FormController.fromForm(form);

    await stored.start();

    expect(await stored.getService(Validate).run()).toBe(false);
    expect(await stored.getService(Validate).run()).toBe(true);
  });

  test('an item is dirty while its value differs from the initial one', async () => {
    const state = () => controller.getForm().state;
    const name = () => controller.getForm().items[0];

    expect(state()).toMatchObject({
      dirty: false,
      touched: false,
      valid: true
    });

    await controller.getService(SetValue).run('name', 'ab');

    // The control function of name changed age as well
    expect(name().dirty).toBe(true);
    expect(controller.getForm().items[1].dirty).toBe(true);
    expect(state()?.dirty).toBe(true);

    await controller.getService(SetValue).run('name', 'a');

    expect(name().dirty).toBe(false);
    expect(state()?.dirty).toBe(false);

    await controller.getService(SetValue).run('address', 'y');
    await controller.getService(ResetItem).run('address');

    expect(state()?.dirty).toBe(false);
  });

  test('Touch marks an item as touched until the form is reset', async () => {
    await controller.getService(Touch).run('name');

    expect(controller.getForm().items[0].touched).toBe(true);
    expect(controller.getForm().state?.touched).toBe(true);

    await controller.getService(Reset).run();

    expect(controller.getForm().items[0].touched).toBeFalsy();
    expect(controller.getForm().state?.touched).toBe(false);
  });

  test('the state object only changes when the state does', async () => {
    const before = controller.getForm().state;

    await controller.getService(Touch).run('name');

    const touched = controller.getForm().state;

    await controller.getService(Touch).run('age');

    expect(touched).not.toBe(before);
    expect(controller.getForm().state).toBe(touched);
  });

  test('Submit validates, gives the values to the handler and fires SUBMIT', async () => {
    const handler = jest.fn();
    const submitted = jest.fn();
    const submit = controller.getService(Submit);

    controller.on('SUBMIT', submitted);
    await controller.getService(SetValue).run('name', '');

    expect(await submit.run(handler)).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(controller.getForm().state).toMatchObject({
      valid: false,
      submitting: false,
      submitCount: 1
    });

    await controller.getService(SetValue).run('name', 'Jane');

    expect(await submit.run(handler)).toBe(true);
    expect(handler).toHaveBeenCalledWith({
      name: 'Jane',
      age: 4,
      address: { city: 'x' }
    });
    expect(submitted).toHaveBeenCalledTimes(1);
    expect(controller.getForm().state).toMatchObject({
      valid: true,
      submitCount: 2
    });
  });

  test('a form that is being submitted is not submitted again', async () => {
    const { closed, open } = gate();
    const handler = jest.fn(() => closed);
    const submit = controller.getService(Submit);
    const first = submit.run(handler);

    expect(controller.getForm().state?.submitting).toBe(true);
    expect(await submit.run(handler)).toBe(false);

    open();

    expect(await first).toBe(true);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(controller.getForm().state).toMatchObject({
      submitting: false,
      submitCount: 1
    });
  });

  test('what the submit handler throws becomes an error of the form', async () => {
    const failed = jest.fn();
    const submit = controller.getService(Submit);

    controller.on('SUBMIT_ERROR', failed);

    expect(
      await submit.run(async () => {
        throw new Error('The server is down');
      })
    ).toBe(false);
    expect(controller.getForm().state).toMatchObject({
      errors: ['The server is down'],
      submitting: false
    });
    expect(failed).toHaveBeenCalledWith(new Error('The server is down'));

    // The next attempt starts without the old error; so does a reset
    expect(await submit.run()).toBe(true);
    expect(controller.getForm().state?.errors).toEqual([]);
  });

  test('a SUBMIT listener that throws does not turn a submit into a failed one', async () => {
    const handler = jest.fn();

    controller.on('SUBMIT', () => {
      throw new Error('listener failed');
    });

    await expect(controller.getService(Submit).run(handler)).rejects.toThrow(
      'listener failed'
    );
    expect(handler).toHaveBeenCalledTimes(1);
    expect(controller.getForm().state).toMatchObject({
      errors: [],
      submitting: false,
      submitCount: 1
    });
  });

  test('something thrown without a message gets a general one', async () => {
    await controller.getService(Submit).run(async () => {
      throw { status: 500 };
    });

    expect(controller.getForm().state?.errors).toEqual([
      'The form could not be submitted.'
    ]);
  });

  test('Reset forgets the submit attempts', async () => {
    await controller.getService(Submit).run();
    await controller.getService(Reset).run();

    expect(controller.getForm().state?.submitCount).toBe(0);
  });

  test('an item in error that is hidden does not make the form invalid', async () => {
    const form = createForm();

    form.items[0] = {
      ...form.items[0],
      value: '',
      control: async ({ formItem }) => [{ ...formItem, hidden: true }]
    };

    const hiding = await FormController.fromForm(form);

    await hiding.start();
    await hiding.getService(Trigger).run('name');

    expect(hiding.getForm().state?.valid).toBe(false);

    await hiding.getService(SetValue).run('name', '');

    expect(hiding.getForm().state?.valid).toBe(true);
  });

  test('UPDATE_ITEM carries the items as the form holds them', async () => {
    const updated = jest.fn();

    controller.on('UPDATE_ITEM', updated);
    await controller.getService(SetValue).run('name', 'abc');

    expect(updated.mock.calls[0][0]).toEqual([
      controller.getForm().items[0],
      controller.getForm().items[1]
    ]);
    expect(updated.mock.calls[0][0][1].dirty).toBe(true);
  });

  test('a field left while its control function runs stays touched', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = async ({ formItem }) => {
      await closed;

      return [{ ...formItem, label: 'Checked' }];
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const setting = slow.getService(SetValue).run('name', 'b');

    await slow.getService(Touch).run('name');
    open();
    await setting;

    expect(slow.getForm().items[0]).toMatchObject({
      label: 'Checked',
      touched: true
    });
  });

  test('a validation is cancelled when its item is validated again, changed or reset', async () => {
    const form = createForm();
    const signals: AbortSignal[] = [];
    const { closed, open } = gate();

    form.items[0].validation = async (_command, context) => {
      signals.push(context?.signal as AbortSignal);
      await closed;

      // What fetch does with an aborted signal
      if (context?.signal.aborted) throw new Error('aborted');

      return { error: false };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const runs = [slow.getService(Trigger).run('name')];

    runs.push(slow.getService(Trigger).run('name'));
    await slow.getService(SetValue).run('name', 'b');
    runs.push(slow.getService(Trigger).run('name'));
    await slow.getService(Reset).run();
    runs.push(slow.getService(Trigger).run('name'));
    open();

    // A cancelled validation that rejects does not reject the service
    await Promise.all(runs);

    expect(signals.map((signal) => signal.aborted)).toEqual([
      true,
      true,
      true,
      false
    ]);
    expect(slow.getForm().items[0].error).toBe(false);
    expect(slow.getForm().items[0].validating).toBeFalsy();
    expect(slow.getForm().state?.validating).toBe(false);
  });

  test('items are validating while they are validated, also when a validation throws', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].validation = async () => {
      await closed;

      throw new Error('validation failed');
    };
    form.items[1].validation = async () => ({ error: false });

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    // Shown once the validation takes a while
    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(slow.getForm().items.map((item) => item.validating)).toEqual([
      true,
      true,
      undefined
    ]);
    expect(slow.getForm().state?.validating).toBe(true);

    open();
    await expect(validation).rejects.toThrow('validation failed');

    expect(slow.getForm().items.map((item) => item.validating)).toEqual([
      false,
      false,
      undefined
    ]);
  });

  test('Validate uses the result of the validation that replaced its own', async () => {
    const form = createForm();
    const { closed, open } = gate();
    let calls = 0;

    form.items[0].validation = async () => {
      if (++calls === 1) await closed;

      return { error: calls > 1, errorMessages: ['newer'] };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await slow.getService(Trigger).run('name');
    open();

    expect(await validation).toBe(false);
    expect(slow.getForm().items[0].errorMessages).toEqual(['newer']);
  });

  test('validations that do not wait for anything notify once', async () => {
    const subscriber = jest.fn();

    controller.subscribe(subscriber);
    await controller.getService(Validate).run();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(controller.getForm().items[0].validating).toBeUndefined();
  });

  test('an item that changes while the form is submitted is validated with its new value', async () => {
    const form = createForm();
    const { closed, open } = gate();
    const handler = jest.fn();

    // Slow for the first value only
    form.items[0].validation = async (command) => {
      if (command.formItem.value === 'a') await closed;

      return (required as NonNullable<Item['validation']>)(command);
    };
    form.items[0].control = undefined;

    const slow = await FormController.fromForm(form);

    await slow.start();

    const submit = slow.getService(Submit).run(handler);

    await slow.getService(SetValue).run('name', '');
    open();

    expect(await submit).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(slow.getForm().items[0]).toMatchObject({
      value: '',
      error: true
    });
  });

  test('an item that changes before its turn is validated as it is then', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].control = undefined;
    form.items[0].validation = async () => {
      await closed;

      return { error: false };
    };
    form.items[1].validation = required;

    const slow = await FormController.fromForm(form);

    await slow.start();
    await slow.getService(SetValue).run('age', 0);

    const validation = slow.getService(Validate).run();

    await slow.getService(SetValue).run('age', 7);
    open();

    expect(await validation).toBe(true);
    expect(slow.getForm().items[1].error).toBeFalsy();
  });

  test('a reset while the form is validated leaves the reset form untouched', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[0].validation = async () => {
      await closed;

      return { error: false };
    };
    form.items[1].validation = async () => ({
      error: true,
      errorMessages: ['late']
    });

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Validate).run();

    await slow.getService(Reset).run();
    open();

    expect(await validation).toBe(false);
    expect(slow.getForm().items[1].error).toBeFalsy();
    expect(slow.getForm().state?.validating).toBe(false);
  });

  test('a result is not written onto a value a control function changed meanwhile', async () => {
    const form = createForm();
    const { closed, open } = gate();

    form.items[1].validation = async () => {
      await closed;

      return { error: true, errorMessages: ['for the old value'] };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const stale = slow.getService(Trigger).run('age');

    // The control function of name changes the value of age
    await slow.getService(SetValue).run('name', 'abc');
    open();
    await stale;

    expect(slow.getForm().items[1]).toMatchObject({ value: 3 });
    expect(slow.getForm().items[1].error).toBeFalsy();
  });

  test('items that were validated before stop validating when a validation throws', async () => {
    const form = createForm();
    const { closed, open } = gate();
    let fail = false;

    form.items[0].validation = async () => {
      if (!fail) return { error: false };

      await closed;

      throw new Error('validation failed');
    };
    form.items[1].validation = async () => ({ error: false });

    const slow = await FormController.fromForm(form);

    await slow.start();
    await slow.getService(Trigger).run('age');

    fail = true;

    const validation = slow.getService(Validate).run();

    await new Promise((resolve) => setTimeout(resolve, 5));

    expect(slow.getForm().state?.validating).toBe(true);

    open();
    await expect(validation).rejects.toThrow('validation failed');

    expect(slow.getForm().state?.validating).toBe(false);
  });

  test('a control function does not put an ended validation back', async () => {
    const form = createForm();
    const { closed, open } = gate();
    const validating = gate();

    form.items[0].control = async ({ getItem }) => {
      const age = getItem('age') as Item;

      await closed;

      return [{ ...age, label: 'Checked' }];
    };
    form.items[1].validation = async () => {
      await validating.closed;

      return { error: false };
    };

    const slow = await FormController.fromForm(form);

    await slow.start();

    const validation = slow.getService(Trigger).run('age');

    await new Promise((resolve) => setTimeout(resolve, 5));

    // The control function reads age while it is validating
    const setting = slow.getService(SetValue).run('name', 'b');

    validating.open();
    await validation;
    open();
    await setting;

    expect(slow.getForm().items[1]).toMatchObject({ label: 'Checked' });
    expect(slow.getForm().items[1].validating).toBeFalsy();
  });

  describe('validateDebounce', () => {
    const validation = jest.fn(async () => ({ error: false }));

    const startDebounced = async () => {
      const form = createForm();

      form.items[0] = { ...form.items[0], validation, validateDebounce: 300 };

      const debounced = await FormController.fromForm(form);

      await debounced.start();

      return debounced;
    };

    beforeEach(() => {
      validation.mockClear();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    test('Trigger validates once after the item was triggered several times', async () => {
      const debounced = await startDebounced();
      const runs = [];

      for (const value of ['a', 'ab', 'abc']) {
        await debounced.getService(SetValue).run('name', value);
        runs.push(debounced.getService(Trigger).run('name'));
        await jest.advanceTimersByTimeAsync(100);
      }

      expect(validation).not.toHaveBeenCalled();

      await jest.advanceTimersByTimeAsync(300);
      await Promise.all(runs);

      expect(validation).toHaveBeenCalledTimes(1);
      expect(validation).toHaveBeenCalledWith(
        expect.objectContaining({
          formItem: expect.objectContaining({ value: 'abc' })
        }),
        expect.anything()
      );
    });

    test('Validate does not wait and takes the place of a waiting validation', async () => {
      const debounced = await startDebounced();
      const waiting = debounced.getService(Trigger).run('name');

      expect(await debounced.getService(Validate).run()).toBe(true);
      expect(validation).toHaveBeenCalledTimes(1);

      await jest.advanceTimersByTimeAsync(300);
      await waiting;

      expect(validation).toHaveBeenCalledTimes(1);
    });

    test('a waiting validation is dropped when the form is reset', async () => {
      const debounced = await startDebounced();
      const waiting = debounced.getService(Trigger).run('name');

      await debounced.getService(Reset).run();
      await jest.advanceTimersByTimeAsync(300);
      await waiting;

      expect(validation).not.toHaveBeenCalled();
    });
  });
});

describe('a validation of the form as a whole', () => {
  let problems: string[];

  /** Reports the problems the test sets. */
  class Whole {
    public static validation: FormValidation = () => problems;

    public get name() {
      return 'whole';
    }

    public initialize(command: Parameters<typeof addFormValidation>[0]) {
      addFormValidation(command, Whole.validation);
      addFormValidation(command, async () => []);
    }
  }

  let controller: FormController<Entity, Item>;

  beforeEach(async () => {
    problems = [];
    controller = await FormController.fromForm({
      ...createForm(),
      services: [...(createForm().services ?? []), Whole]
    });
    await controller.start();
  });

  test('its messages are the errors of the form, which is not valid then', async () => {
    problems = ['The dates are not in order'];

    expect(await controller.getService(Validate).run()).toBe(false);
    expect(controller.getForm().state?.errors).toEqual([
      'The dates are not in order'
    ]);

    expect(controller.getForm().state?.valid).toBe(false);

    problems = [];

    expect(await controller.getService(Validate).run()).toBe(true);
    expect(controller.getForm().state).toMatchObject({
      errors: [],
      valid: true
    });
  });

  test('the error of a submit that was refused stays when the form is validated', async () => {
    await controller.getService(Submit).run(() => {
      throw new Error('Email is taken');
    });
    problems = ['Not yet'];
    await controller.getService(Validate).run();

    expect(controller.getForm().state?.errors).toEqual([
      'Email is taken',
      'Not yet'
    ]);

    problems = [];
    await controller.getService(Validate).run();

    expect(controller.getForm().state?.errors).toEqual(['Email is taken']);
  });

  test('ClearErrors and Reset remove its messages', async () => {
    for (const clear of [
      () => controller.getService(ClearErrors).run(),
      () => controller.getService(Reset).run()
    ]) {
      problems = ['Not yet'];
      await controller.getService(Validate).run();

      expect(controller.getForm().state?.valid).toBe(false);

      await clear();

      expect(controller.getForm().state).toMatchObject({
        errors: [],
        valid: true
      });
    }
  });

  test('an answer that arrives after the form was reset, or after a newer one, is dropped', async () => {
    const waiting: Array<(messages: string[]) => void> = [];

    Whole.validation = () =>
      new Promise<string[]>((resolve) => waiting.push(resolve));

    try {
      const fresh = await FormController.fromForm({
        ...createForm(),
        services: [...(createForm().services ?? []), Whole]
      });

      await fresh.start();

      const tick = () => new Promise((resolve) => setTimeout(resolve));
      const before = fresh.getService(Validate).run();

      await tick();
      await fresh.getService(Reset).run();
      waiting.splice(0).forEach((answer) => answer(['Too late']));

      expect(await before).toBe(false);
      expect(fresh.getForm().state).toMatchObject({ errors: [], valid: true });

      const older = fresh.getService(Validate).run();

      await tick();

      const newer = fresh.getService(Validate).run();

      await tick();
      waiting[1](['Newer']);
      await newer;
      waiting[0](['Older']);
      await older;

      expect(fresh.getForm().state?.errors).toEqual(['Newer']);
    } finally {
      Whole.validation = () => problems;
    }
  });

  test('a form with such a problem is not submitted', async () => {
    const handler = jest.fn();
    const failed = jest.fn();

    controller.on('SUBMIT_ERROR', failed);
    problems = ['Not yet'];

    expect(await controller.getService(Submit).run(handler)).toBe(false);
    expect(handler).not.toHaveBeenCalled();
    expect(failed).not.toHaveBeenCalled();
    expect(controller.getForm().state).toMatchObject({
      errors: ['Not yet'],
      submitting: false,
      submitCount: 1
    });

    // Shown besides the errors of the items
    await controller.getService(SetValue).run('name', '');

    expect(await controller.getService(Submit).run(handler)).toBe(false);
    expect(controller.getForm().items[0].error).toBe(true);
    expect(controller.getForm().state?.errors).toEqual(['Not yet']);

    problems = [];
    await controller.getService(SetValue).run('name', 'a');

    expect(await controller.getService(Submit).run(handler)).toBe(true);
    expect(controller.getForm().state?.errors).toEqual([]);
  });

  test('a validation that throws fails the submit and rejects the validation', async () => {
    Whole.validation = () => {
      throw new Error('no connection');
    };

    try {
      const fresh = await FormController.fromForm({
        ...createForm(),
        services: [...(createForm().services ?? []), Whole]
      });

      await fresh.start();

      await expect(fresh.getService(Validate).run()).rejects.toThrow(
        'no connection'
      );
      expect(await fresh.getService(Submit).run(jest.fn())).toBe(false);
      expect(fresh.getForm().state?.errors).toEqual(['no connection']);
    } finally {
      Whole.validation = () => problems;
    }
  });
});
