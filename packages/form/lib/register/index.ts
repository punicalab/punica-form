import { Renderer } from '..';

export class FormItemRegister {
  private static _instance: FormItemRegister;
  private _itemMap: Map<string, Renderer> = new Map<string, Renderer>();

  /**
   *
   */
  private constructor() {}

  /**
   *
   */
  public static getInstance(): FormItemRegister {
    if (!FormItemRegister._instance) {
      FormItemRegister._instance = new FormItemRegister();
    }

    return FormItemRegister._instance;
  }

  /**
   *
   * @param property
   * @param renderer
   * @returns
   */
  public register(property: string, renderer: Renderer): boolean {
    if (this._itemMap.has(property)) {
      return false;
    }

    this._itemMap.set(property, renderer);

    return true;
  }

  /**
   *
   * @param property
   * @returns
   */
  public getItem(property: string): Renderer {
    return this._itemMap.get(property);
  }

  /**
   *
   * @returns
   */
  public getItems(): Map<string, Renderer> {
    return this._itemMap;
  }

  /**
   *
   * @returns
   */
  public getKeys(): IterableIterator<string> {
    return this._itemMap.keys();
  }
}
