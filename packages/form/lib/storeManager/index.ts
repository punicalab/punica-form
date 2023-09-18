import { IStoreManager } from '../model';

/**
 *
 */
export class StoreManager implements IStoreManager {
  private _store: Record<string, any> = {};

  /**
   *
   */
  constructor() {}

  /**
   *
   * @param store
   */
  setStore(store: Record<string, any>) {
    this._store = store;
  }

  /**
   *
   * @param key
   * @returns
   */
  public read(key: string): any {
    return this._store[key];
  }

  /**
   *
   * @param key
   * @returns
   */
  public write(key: string, value: any): void {
    this._store[key] = value;
  }
}
