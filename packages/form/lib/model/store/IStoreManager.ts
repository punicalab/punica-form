import { ReadStore, WriteStore } from '.';

/**
 *
 */
export interface IStoreManager {
  setStore(store: Record<string, any>): void;
  read: ReadStore;
  write: WriteStore;
}
