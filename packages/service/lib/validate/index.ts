import { CommandService, FormItem, IService } from '@punica/form';

/**
 *
 */
export class Validate<E, F extends FormItem<E>> implements IService<E, F> {
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
  public run<T = boolean>() {
    return new Promise<T>(async (resolve) => {
      const { fireEvent, formData, initialFormData } = this.#command;
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
      console.log(formData, initialFormData);

      fireEvent('UPDATE_FORM', formData);

      resolve(!this.#hasError as T);
    });
  }
}
