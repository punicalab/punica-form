import { BaseListener } from '@punica/common';
import { Renderer } from '@punica/form-model';

export class FormItemRegister extends BaseListener {
  private static _instance: FormItemRegister;
  private _itemMap: Map<string, Renderer> = new Map<string, Renderer>();

  /**
   *
   */
  private constructor() {
    super();
  }

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
   * @param formItemKey
   * @param renderer
   * @returns
   */
  public register(formItemKey: string, renderer: Renderer): boolean {
    if (this._itemMap.has(formItemKey)) {
      return false;
    }

    this._itemMap.set(formItemKey, renderer);

    return true;
  }

  /**
   *
   * @param formItemKey
   * @returns
   */
  public getItem(formItemKey: string): Renderer {
    return this._itemMap.get(formItemKey);
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
