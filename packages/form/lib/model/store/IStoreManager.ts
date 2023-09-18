/**
 *
 */
export interface IStoreManager {
  setStore(store: Record<string, any>): void;
  read(key: string): any;
  write(key: string, value: any): void;
}
