import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class Validate<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<boolean>
{
  #command: CommandService<E, F> = null;
  #name: string = 'validate';
  #hasError: boolean = false;

  /**
   *
   * @returns
   */
  public get name() {
    return this.#name;
  }

  /**
   *
   * @param command
   */
  public initialize(command: CommandService<E, F>) {
    this.#command = command;
  }

  /**
   *
   * @returns
   */
  public run() {
    return new Promise<boolean>(async (resolve) => {
      const { fireEvent, formData } = this.#command;
      const { items } = formData;

      this.#hasError = false;

      for await (const item of items) {
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

      fireEvent('UPDATE_FORM', formData);

      resolve(!this.#hasError);
    });
  }
}
