import { CommandService, FormItem, IService } from '../..';

/**
 *
 */
export class Service<E, F extends FormItem<E>> implements IService<E, F> {
  //@ts-ignore
  #command: CommandService<E, F> = null;
  #name: string = 'service';

  /**
   *
   */
  constructor() {}

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
    //@ts-ignore
    this.#command = command;
  }

  /**
   *
   * @returns
   */
  public getItemCommand() {
    return {
      customCommand: () => {
        console.log('call custom');
      }
    };
  }

  /**
   *
   * @returns
   */
  public run<T>() {
    return new Promise<T>(() => {});
  }
}
