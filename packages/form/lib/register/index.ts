import { IFormItem, IRender } from '..';

export class FormItemRegister<F extends IFormItem> {
  private static _instance: FormItemRegister<any>;
  private _itemMap: Map<string, IRender<F>> = new Map<string, IRender<F>>();

  /**
   *
   */
  private constructor() {}

  /**
   *
   */
  public static getInstance(): FormItemRegister<any> {
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
  public register(property: string, renderer: IRender<F>): boolean {
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
  public getItem(property: string): IRender<F> {
    return this._itemMap.get(property);
  }

  /**
   *
   * @returns
   */
  public getItems(): Map<string, IRender<F>> {
    return this._itemMap;
  }

  /**
   *
   * @returns
   */
  public getItemKeys(): IterableIterator<string> {
    return this._itemMap.keys();
  }
}
