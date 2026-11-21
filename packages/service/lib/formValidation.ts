import { CommandService, FormItem } from '@punica/form';

/**
 * A validation of a form as a whole: returns the messages of what is wrong,
 * none for a valid form.
 */
export type FormValidation = () => string[] | Promise<string[]>;

const validations = new WeakMap<object, FormValidation[]>();

/**
 * Adds a validation of the form as a whole, for what does not belong to one
 * item, such as two dates that have to be in order. A service adds it when
 * it is initialized. `Validate` and `Submit` run it after the items: its
 * messages become the errors of the form (`state.errors`), and a form that
 * has some is not valid and not submitted.
 * @param command - What the service received when it was initialized
 */
export const addFormValidation = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  validation: FormValidation
): void => {
  validations.set(command, [...(validations.get(command) ?? []), validation]);
};

/**
 * Runs the validations of the form as a whole and writes their messages to
 * the errors of the form. A form without such validations is left alone.
 * @returns Whether there is no message
 */
export const validateForm = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>
): Promise<boolean> => {
  const added = validations.get(command);

  if (!added) return true;

  const errors = (
    await Promise.all(added.map((validation) => validation()))
  ).flat();

  command.setState({ errors });

  return !errors.length;
};
