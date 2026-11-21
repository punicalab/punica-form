import { CommandService, FormItem } from '@punica/form';

/**
 * A validation of a form as a whole: returns the messages of what is wrong,
 * none for a valid form.
 */
export type FormValidation = () => string[] | Promise<string[]>;

type Whole = {
  validations: FormValidation[];

  /** The messages that are among the errors of the form now. */
  messages: string[];

  /** Changes when the form is reset: what was asked before does not count. */
  epoch: number;

  /** The latest run; an older one does not write. */
  run: number;
};

const forms = new WeakMap<object, Whole>();

/**
 * Adds a validation of the form as a whole, for what does not belong to one
 * item, such as two dates that have to be in order. A service adds it when
 * it is initialized. `Validate` and `Submit` run it after the items: its
 * messages are added to the errors of the form (`state.errors`), and a form
 * that has some is not valid (`state.valid`) and not submitted. `Reset` and
 * `ClearErrors` remove them.
 * @param command - What the service received when it was initialized
 */
export const addFormValidation = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  validation: FormValidation
): void => {
  const whole = forms.get(command) ?? {
    validations: [],
    messages: [],
    epoch: 0,
    run: 0
  };

  whole.validations.push(validation);
  forms.set(command, whole);
};

/** Replaces the messages of the validations among the errors of the form. */
const write = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  whole: Whole,
  messages: string[]
): void => {
  const others = (command.getForm().state?.errors ?? []).filter(
    (error) => !whole.messages.includes(error)
  );

  whole.messages = messages;
  command.setState({
    errors: [...others, ...messages],
    invalid: messages.length > 0
  });
};

/**
 * What tells a validation of the form that the form was reset since:
 * read it before validating the items and give it to `validateForm`.
 */
export const formEpoch = (command: object): number => {
  return forms.get(command)?.epoch ?? 0;
};

/**
 * Runs the validations of the form as a whole and writes their messages
 * among the errors of the form; the other errors, such as the one of a
 * rejected submit, stay. A form without such validations is left alone.
 * @param epoch - `formEpoch` from before the items were validated
 * @returns Whether there is no message. `false` as well when the form was
 * reset meanwhile
 */
export const validateForm = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  epoch = formEpoch(command)
): Promise<boolean> => {
  const whole = forms.get(command);

  if (!whole) return true;
  if (whole.epoch !== epoch) return false;

  const run = ++whole.run;
  const messages = (
    await Promise.all(whole.validations.map((validation) => validation()))
  ).flat();

  if (whole.epoch !== epoch) return false;

  // A run that was started later has the newer answer
  if (run === whole.run) write(command, whole, messages);

  return !messages.length;
};

/**
 * Removes the messages of the validations of the form as a whole.
 * @param reset - The form is reset: validations that are running do not
 * count any more
 */
export const clearFormValidation = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  reset = false
): void => {
  const whole = forms.get(command);

  if (!whole) return;

  if (reset) whole.epoch++;

  whole.run++;
  write(command, whole, []);
};
