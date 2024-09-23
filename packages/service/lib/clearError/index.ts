import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Service for clearing errors on a specific form item.
 */
export class ClearError<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'clearError';

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
   * Clears errors on the specified form item.
   * @param {keyof E} property - The name of the property to clear errors for.
   * @returns {Promise<void>} - Resolves when the operation is complete.
   */
  public run(property: keyof E): Promise<void> {
    return new Promise<void>((resolve) => {
      const { form, getItem, fireEvent } = this.#command;
      const item = getItem(property);

      // Clear errors
      item.error = false;
      item.errorMessages = null;

      // Trigger update event
      fireEvent('UPDATE_FORM', form);

      resolve();
    });
  }
}
