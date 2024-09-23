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
  public initialize(command: CommandService<E, F>) {
    this.#command = command;
  }

  /**
   * Resets the form to its initial state.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  public run(): Promise<void> {
    return new Promise<void>((resolve) => {
      const { fireEvent, initialForm } = this.#command;

      // Create a deep copy of the initial form data
      const formCopy = deepCopy(initialForm);

      // Trigger an update event to reset the form
      fireEvent('UPDATE_FORM', formCopy);

      resolve();
    });
  }
}
