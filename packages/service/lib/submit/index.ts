import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { formEpoch, validateForm } from '../formValidation';
import { messageOf } from '../message';
import { readValues } from '../readValues';
import { validateItems } from '../validateItem';

/**
 * Submits the form: validates it and gives its values to a handler.
 */
export class Submit<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'submit';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * Validates every item and, when the form is valid, calls the handler with
   * its values and fires SUBMIT. While it runs the state of the form is
   * `submitting`; a submit that is started meanwhile is ignored.
   *
   * What the handler or a validation throws does not reject: the message of
   * the error, or a general one when it has none, becomes an error of the
   * form (`state.errors`) and SUBMIT_ERROR is fired.
   * @returns Whether the form was valid and the handler finished
   */
  public async run(
    handler?: (values: E) => void | Promise<void>
  ): Promise<boolean> {
    const { getForm, setState, emit } = this.#command;

    if (getForm().state?.submitting) {
      return false;
    }

    setState({ submitting: true, errors: [] });

    let values: E;

    try {
      const epoch = formEpoch(this.#command);
      const items = await validateItems(this.#command, getForm().items);
      // What is wrong with the form as a whole is shown besides its items
      const form = await validateForm(this.#command, epoch);

      if (!items || !form) {
        return false;
      }

      values = readValues(this.#command);
      await handler?.(values);
    } catch (error) {
      setState({ errors: [messageOf(error)] });
      emit('SUBMIT_ERROR', error);

      return false;
    } finally {
      setState({
        submitting: false,
        submitCount: (getForm().state?.submitCount ?? 0) + 1
      });
    }

    // After the submit is over: a listener that throws does not undo it
    emit('SUBMIT', values);

    return true;
  }
}
