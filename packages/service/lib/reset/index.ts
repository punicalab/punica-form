import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
} from '@punica/form';
import { clearFormValidation } from '../formValidation';
import { resetRows } from '../rows';
import { dropValidations } from '../validateItem';

/**
 * Resets the form to the state it was started with.
 */
export class Reset<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'reset';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * Fires RESET after the form was updated.
   */
  public async run(): Promise<void> {
    const { getForm, getInitialItems, setItems, setState, supersede, emit } =
      this.#command;

    // Results of control functions that are still running are dropped
    supersede();
    dropValidations(this.#command);
    clearFormValidation(this.#command, true);

    // The rows of the lists are created anew, which takes a moment; the
    // items are reset at once, as in a form without lists
    const rows = resetRows(this.#command);

    // A fresh copy, so the initial state stays intact
    setItems(deepCopy(getInitialItems()));
    setState({ errors: [], submitCount: 0, invalid: false });

    if (rows) await rows;

    emit('RESET', getForm());
  }
}
