import { IServiceCommand } from '@punica/form';

/**
 * What `Store` adds to the command of the functions of form items:
 * `validation: ({ readStoreItem }: CommandItem<E, F, StoreCommand>) => …`
 */
export type StoreCommand = {
  readStoreItem: (key: string) => unknown;
  writeStoreItem: (key: string, value: unknown) => void;
  deleteStoreItem: (key: string) => void;
};

/**
 * A key-value store the functions of the form items share.
 */
export class Store implements IServiceCommand {
  #store = new Map<string, unknown>();

  public get name(): string {
    return 'store';
  }

  public addCustomFeaturesForCommandItem(): StoreCommand {
    return {
      readStoreItem: (key) => this.#store.get(key),
      writeStoreItem: (key, value) => void this.#store.set(key, value),
      deleteStoreItem: (key) => void this.#store.delete(key)
    };
  }
}
