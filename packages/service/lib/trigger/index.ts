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
  public initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    return Promise.resolve();
  }

  /**
   * Called when the value of a form item is changed.
   * @param property - Property of the changed item.
   */
  public async run(property: keyof E): Promise<void> {
    const { fireEvent, getItem, form, createCommandItem } = this.#command;
    const item = getItem(property);

    if (!item) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    const { validation, hidden } = item;

    if (validation && !hidden) {
      const commandItem = await createCommandItem(item);
      const { error, errorMessages } = await validation(commandItem);

      item.error = error;
      item.errorMessages = errorMessages;
    }

    fireEvent('UPDATE_FORM', form);
  }
}
