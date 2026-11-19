import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
} from '@punica/form';

/**
 * Service for resetting the form to its initial state.
 */
export class Reset<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'reset';

  /**
   * Returns the name of the service.
   * @returns {string} - Service name
   */
  public get name(): string {
    return this.#name;
  }

  /**
   * Initializes the service with a command.
   * @param command - The command service to be used.
   */
  public initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    return Promise.resolve();
  }

  /**
   * Resets the form to its initial state.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  public async run(): Promise<void> {
    const { fireEvent, form, initialForm } = this.#command;

    // Restore the items from a fresh copy so the initial state stays intact
    form.items = deepCopy(initialForm.items);

    fireEvent('RESET', form);
    fireEvent('UPDATE_FORM', form);
  }
}
