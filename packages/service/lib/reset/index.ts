import { CommandService, FormItem, IServiceControl } from '@punica/form';

/**
 *
 */
export class Reset<E, F extends FormItem<E>> implements IServiceControl<E, F> {
  #command: CommandService<E, F> = null;
  #name: string = 'reset';

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
  public run<T>() {
    return new Promise<T>(() => {
      const { fireEvent, initialFormData } = this.#command;

      fireEvent('UPDATE_FORM', initialFormData);
    });
  }
}
