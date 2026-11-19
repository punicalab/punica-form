import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
} from '@punica/form';

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
    const { getForm, getInitialItems, setItems, emit } = this.#command;

    // A fresh copy, so the initial state stays intact
    setItems(deepCopy(getInitialItems()));
    emit('RESET', getForm());
  }
}
