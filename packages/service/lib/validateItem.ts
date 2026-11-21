import { CommandService, ErrorDetail, FormItem } from '@punica/form';

/** A validation of an item that was started. */
type Run = {
  abort: AbortController;

  /** The value that is validated. */
  value: unknown;

  settled: boolean;

  /** `undefined` when the validation was cancelled. */
  result: Promise<ErrorDetail | undefined>;
};

/** What is going on for the properties of a form. */
type Pending = {
  /** The latest validation of a property, running or not. */
  runs: Map<PropertyKey, Run>;

  /** Ends the delay a validation of a property is waiting for. */
  delays: Map<PropertyKey, () => void>;

  /** Changes when every validation of the form is dropped. */
  epoch: number;
};

const pending = new WeakMap<object, Pending>();

const pendingOf = (command: object): Pending => {
  const found = pending.get(command) ?? {
    runs: new Map(),
    delays: new Map(),
    epoch: 0
  };

  pending.set(command, found);

  return found;
};

/**
 * Cancels the validations of a form that are running or waiting for their
 * delay: of one property, or of every property. Their `signal` is aborted
 * and their results are not written.
 */
export const dropValidations = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property?: keyof E
): void => {
  const state = pendingOf(command);
  const { runs, delays } = state;
  const keys = property === undefined ? [...runs.keys()] : [property];

  if (property === undefined) state.epoch++;

  for (const key of keys) {
    runs.get(key)?.abort.abort();
    runs.delete(key);
  }

  for (const key of property === undefined ? [...delays.keys()] : keys) {
    delays.get(key)?.();
  }
};

/**
 * Waits for the delay of a validation (`validateDebounce` of the item).
 * @returns Whether to validate: `false` when the property was validated,
 * changed again or reset before the delay was over
 */
export const delayValidation = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  milliseconds: number
): Promise<boolean> => {
  const { delays } = pendingOf(command);

  delays.get(property)?.();

  return new Promise((resolve) => {
    const finish = (validate: boolean) => {
      clearTimeout(timer);
      delays.delete(property);
      resolve(validate);
    };
    const timer = setTimeout(() => finish(true), milliseconds);

    delays.set(property, () => finish(false));
  });
};

const isValidated = <E>(item: FormItem<E>): boolean => {
  return Boolean(item.validation) && !item.hidden && !item.disabled;
};

/** Starts the validation of an item; the one before it is cancelled. */
const start = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  item: F
): Run => {
  const { runs, delays } = pendingOf(command);
  const abort = new AbortController();

  // Also when it is over: its result must not be written after a newer one
  runs.get(item.property)?.abort.abort();
  delays.get(item.property)?.();

  const validate = async (): Promise<ErrorDetail | undefined> => {
    try {
      const { error, errorMessages } = await (
        item.validation as NonNullable<F['validation']>
      )(command.createCommandItem(item), { signal: abort.signal });

      return abort.signal.aborted ? undefined : { error, errorMessages };
    } catch (error) {
      // A cancelled request rejects; that is not a failed validation
      if (abort.signal.aborted) return undefined;

      throw error;
    } finally {
      run.settled = true;
    }
  };
  const run: Run = {
    abort,
    value: item.value,
    settled: false,
    result: Promise.resolve().then(validate)
  };

  runs.set(item.property, run);

  return run;
};

/**
 * Validates items one after the other, each as it is when its turn comes,
 * and writes the results onto the items as they are then: only the error
 * state is what a validation knows.
 *
 * A validation is cancelled when its item is validated again, changed or
 * reset. The validation that replaced it counts then. When a verdict on the
 * items is asked for, an item that changed is validated again with its new
 * value; otherwise it is left alone. A result is never written onto a value
 * it was not made for. Items that take a while are `validating`.
 *
 * Items without a validation function, hidden items and disabled items are
 * not validated.
 * @returns Whether every validated item is valid. `false` as well when the
 * form was reset meanwhile
 */
export const validateItems = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  items: F[],
  { verdict = true }: { verdict?: boolean } = {}
): Promise<boolean> => {
  const state = pendingOf(command);
  const { epoch } = state;
  const properties = items.filter(isValidated).map((item) => item.property);
  const waiting = new Set(properties);
  const finished = new Map<keyof E, { run: Run; result: ErrorDetail }>();

  // Only validations that take a while are shown as running: a form whose
  // validations do not wait for anything is not notified twice
  const marker = setTimeout(() => {
    if (state.epoch !== epoch) return;

    command.setItems(
      [...waiting].flatMap((property) => {
        const now = command.getItem(property);

        return now && !now.validating ? [{ ...now, validating: true }] : [];
      })
    );
  });

  const write = (): void => {
    const written: F[] = [];

    for (const property of properties) {
      const now = command.getItem(property);
      const done = finished.get(property);
      const running = state.runs.get(property)?.settled === false;

      if (!now) continue;

      const result =
        done &&
        !done.run.abort.signal.aborted &&
        Object.is(now.value, done.run.value)
          ? done.result
          : undefined;

      if (result || (now.validating && !running)) {
        written.push({
          ...now,
          ...result,
          ...(now.validating && !running ? { validating: false } : {})
        });
      }
    }

    command.setItems(written);
  };

  let valid = true;

  try {
    for (const property of properties) {
      let run: Run | undefined;
      let own = false;
      let result: ErrorDetail | undefined;

      while (!result) {
        if (state.epoch !== epoch) return false;

        const newer = state.runs.get(property);

        if (run && newer && newer !== run) {
          // Validated again by someone else: that validation counts
          run = newer;
          own = false;
        } else if (run && !verdict) {
          // Changed or reset: nobody waits for a verdict on the new value
          break;
        } else {
          const now = command.getItem(property);

          if (!now || !isValidated(now)) break;

          run = start(command, now);
          own = true;
        }

        result = await run.result;
      }

      waiting.delete(property);

      if (result?.error) valid = false;
      if (result && run && own) finished.set(property, { run, result });
    }

    return valid;
  } finally {
    clearTimeout(marker);

    // A form that was reset has new items; nothing of this run belongs there
    if (state.epoch === epoch) write();
  }
};
