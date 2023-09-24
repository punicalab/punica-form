import { FormItem, IService } from '@punica/form';

/**
 *
 */
export class Store<E, F extends FormItem<E>> implements IService<E, F> {
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
  public getItemCommand() {
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
