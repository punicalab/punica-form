import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class Trigger<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'trigger';

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
   * @param property
   * @returns
   */
  public run(property: keyof E) {
    return new Promise(async () => {
      const { fireEvent, getItem, formData } = this.#command;
      const item = getItem(property);
      const { validation, hidden } = item;

      if (validation && !hidden) {
        const commandItem = await this.#command.createCommandItem(item);
        const { error, errorMessages } = await validation(commandItem);

        item.error = error;
        item.errorMessages = errorMessages;
      }

      fireEvent('UPDATE_FORM', formData);
    });
  }
}
