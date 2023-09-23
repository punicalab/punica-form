import { CommandService, FormItem, IService } from '@punica/form';

/**
 *
 */
export class Store<E, F extends FormItem<E>> implements IService<E, F> {
  #command: CommandService<E, F> = null;
  #name: string = 'store';

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
