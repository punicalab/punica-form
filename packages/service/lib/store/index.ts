import { IService, IServiceAddCommand } from '@punica/form';

/**
 *
 */
export class Store implements IService, IServiceAddCommand {
  #name: string = 'store';
  #store: Record<string, any> = {};

  /**
   *
   * @returns
   */
  public get name() {
    return this.#name;
  }

  /**
   *
   * @returns
   */
  public addCustomFeaturesForCommandItem() {
    return {
      readStoreItem: (key: string): any => {
        return this.#store[key];
      },
      writeStoreItem: (key: string, value: any) => {
        this.#store[key] = value;
      },
      deleteStoreItem: (key: string) => {
        delete this.#store[key];
      }
    };
  }
}
