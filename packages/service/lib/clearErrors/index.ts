import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Service for clearing errors on form items.
 */
export class ClearErrors<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<boolean>
{
  #command: CommandService<E, F> = null;
  #name: string = 'clearErrors';

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
   * Clears errors on form items.
   * @returns {Promise<boolean>} - Resolves when the operation is complete.
   */
  public run(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      const { fireEvent, formData } = this.#command;
      const { items } = formData;

      // Iterate through form items and clear errors
      for await (const item of items) {
        item.error = false;
        item.errorMessages = null;
      }

      // Trigger form update event
      fireEvent('UPDATE_FORM', formData);

      resolve(true);
    });
  }
}
