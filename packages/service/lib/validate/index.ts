import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Service for validating form items.
 */
export class Validate<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<boolean>
{
  #command: CommandService<E, F> = null;
  #name: string = 'validate';
  #hasError: boolean = false;

  /**
   * Validates a form item.
   * @param {F} item - The form item to be validated.
   */
  private async validateFormItem(item: F) {
    const { validation, hidden } = item;

    if (validation && !hidden) {
      const commandItem = await this.#command.createCommandItem(item);
      const { error, errorMessages } = await validation(commandItem);

      if (error) {
        this.#hasError = true;
      }

      item.error = error;
      item.errorMessages = errorMessages;
    }
  }

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
   * Runs validation checks on all form items.
   * @returns {Promise<boolean>} - Resolves to true if all validations pass, otherwise resolves to false.
   */
  public async run(): Promise<boolean> {
    try {
      const { fireEvent, form } = this.#command;

      this.#hasError = false;

      for await (const item of form.items) {
        await this.validateFormItem(item);
      }

      // Trigger update event
      fireEvent('UPDATE_FORM', form);

      return !this.#hasError;
    } catch (error) {
      // Handle the error condition
      console.error(error);
      return false;
    }
  }
}
