import { IServiceAddCommand } from '@punica/form';

/**
 * Service for storing data.
 */
export class Store implements IServiceAddCommand {
  #name: string = 'store';
  #store: Record<string, any> = {};

  /**
   * Returns the name of the service.
   * @returns {string} - Service name
   */
  public get name() {
    return this.#name;
  }

  /**
   * Adds custom features for command items.
   * @returns {Object} - Object containing custom features.
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
