import { IService, IServiceCommand, IServiceControl } from '../../..';

/**
 *
 */
export class Service implements IService, IServiceCommand, IServiceControl {
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
   */
  public async initialize(): Promise<void> {}

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
