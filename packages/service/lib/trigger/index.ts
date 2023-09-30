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
   * Called when the service is initialized.
   * @param command - Command service
   */
  public initialize(command: CommandService<E, F>) {
    this.#command = command;
  }

  /**
   * Called when the value of a form item is changed.
   * @param property - Property of the changed item
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
        const commandItem = await this.#command.createCommandItem(item);
        const { error, errorMessages } = await validation(commandItem);

        item.error = error;
        item.errorMessages = errorMessages;
      }

      fireEvent('UPDATE_FORM', formData);
    } catch (error) {
      console.error(error);
    }
  }
}
