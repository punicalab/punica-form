import { CommandService, FormItem, IService } from '@punica/form';

/**
 *
 */
export class Reset<E, F extends FormItem<E>> implements IService<E, F> {
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

    console.log(this.#command);
  }

  /**
   *
   * @returns
   */
  public run<T>() {
    return new Promise<T>(() => {});
  }
}
