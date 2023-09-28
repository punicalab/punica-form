import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class ClearErrors<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<boolean>
{
  #command: CommandService<E, F> = null;
  #name: string = 'clearErrors';

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
    return new Promise<boolean>(async () => {
      const { fireEvent, formData } = this.#command;
      const { items } = formData;

      for await (const item of items) {
        item.error = false;
        item.errorMessages = null;
      }

      fireEvent('UPDATE_FORM', formData);
    });
  }
}
