import {
  CommandService,
  FormItem,
  IService,
  IServiceCommand,
  IServiceControl
} from '../../..';

/**
 *
 */
export class Service<E, F extends FormItem<E>>
  implements IService, IServiceCommand, IServiceControl
{
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
  public addCustomFeaturesForCommandItem() {
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
