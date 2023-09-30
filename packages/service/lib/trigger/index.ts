import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Trigger service is triggered when the value of a form item is changed.
 */
export class Trigger<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'trigger';

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
   * Called when the value of a form item is changed.
   * @param property - Property of the changed item.
   */
  public async run(property: keyof E) {
    try {
      const { fireEvent, getItem, formData } = this.#command;
      const item = getItem(property);

      if (!item) {
        throw new Error(`Item not found: ${property as string}`);
      }

      const { validation, hidden } = item;

      if (validation && !hidden) {
        // Create a command item for validation
        const commandItem = await this.#command.createCommandItem(item);

        // Perform validation
        const { error, errorMessages } = await validation(commandItem);

        // Update form item with validation results
        item.error = error;
        item.errorMessages = errorMessages;
      }

      // Trigger an update event to reflect changes in the form
      fireEvent('UPDATE_FORM', formData);
    } catch (error) {
      // Handle errors
      console.error(error);
    }
  }
}
