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
  public get name(): string {
    return this.#name;
  }

  /**
   * Adds custom features for command items.
   * This method provides a set of custom functions that can be used by command items.
   * These functions allow for reading, writing, and deleting data from the internal store.
   * @returns {{
   *   readStoreItem: (key: string) => any,
   *   writeStoreItem: (key: string, value: any) => void,
   *   deleteStoreItem: (key: string) => void
   * }} An object containing custom functions for command items:
   * - `readStoreItem`: A function that takes a `key` (string) and returns the corresponding value from the store.
   * - `writeStoreItem`: A function that takes a `key` (string) and `value` (any) to store in the internal store.
   * - `deleteStoreItem`: A function that takes a `key` (string) and deletes the corresponding item from the store.
   */
  public addCustomFeaturesForCommandItem(): {
    readStoreItem: (key: string) => any;
    writeStoreItem: (key: string, value: any) => void;
    deleteStoreItem: (key: string) => void;
  } {
    return {
      /**
       * Reads a value from the internal store based on the provided key.
       * @param {string} key The key to look up in the store.
       * @returns {any} The value associated with the provided key, or undefined if not found.
       */
      readStoreItem: (key: string): any => {
        return this.#store[key];
      },

      /**
       * Writes a value to the internal store, associating it with the provided key.
       * If a value already exists for the key, it will be overwritten.
       * @param {string} key The key to associate with the provided value.
       * @param {any} value The value to store.
       * @returns {void}
       */
      writeStoreItem: (key: string, value: any): void => {
        this.#store[key] = value;
      },

      /**
       * Deletes an item from the internal store based on the provided key.
       * If no item is found for the key, no action is taken.
       * @param {string} key The key of the item to delete from the store.
       * @returns {void}
       */
      deleteStoreItem: (key: string): void => {
        delete this.#store[key];
      }
    };
  }
}
