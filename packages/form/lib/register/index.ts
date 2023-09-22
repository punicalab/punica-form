import { FormItem } from '..';

type Render<F> = (props: F) => any;

export class FormItemRegister<E, F extends FormItem<E>> {
  private static _instance: FormItemRegister<any, any>;
  private _itemMap: Map<string, Render<F>> = new Map<string, Render<F>>();

  /**
   *
   */
  private constructor() {}

  /**
   *
   */
  public static getInstance(): FormItemRegister<any, any> {
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
  public register(property: string, renderer: (props: F) => any): void {
    if (this._itemMap.has(property)) {
      return;
    }

    console.log(property);
    this._itemMap.set(property, renderer);
  }

  /**
   *
   * @param property
   * @returns
   */
  public unRegister(property: string): void {
    if (!this._itemMap.has(property)) {
      return;
    }

    this._itemMap.delete(property);
  }

  /**
   *
   * @param property
   * @returns
   */
  public getItem(property: string): Render<F> {
    return this._itemMap.get(property);
  }

  /**
   *
   * @returns
   */
  public getItems(): Map<string, Render<F>> {
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
