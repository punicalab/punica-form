import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class ClearError<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'validate';

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
  public run(property: keyof E) {
    return new Promise(() => {
      const { formData, getItem, fireEvent } = this.#command;
      const item = getItem(property);

      item.error = false;
      item.errorMessages = null;

      fireEvent('UPDATE_FORM', formData);
    });
  }
}
