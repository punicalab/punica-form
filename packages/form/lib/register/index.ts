import { FormItem } from '..';

type Render<F> = (props: F) => any;

export class FormItemRegister<E, F extends FormItem<E>> {
  private static _instance: FormItemRegister<any, any>;
  #itemMap: Map<string, Render<F>> = new Map<string, Render<F>>();

  /**
   * Private constructor to prevent external instantiation.
   */
  private constructor() {}

  /**
   * Singleton pattern: Get the instance of FormItemRegister.
   * @returns The instance of FormItemRegister.
   */
  public static getInstance(): FormItemRegister<any, any> {
    if (!FormItemRegister._instance) {
      FormItemRegister._instance = new FormItemRegister();
    }

    return FormItemRegister._instance;
  }

  /**
   * Register a form item property with its corresponding renderer.
   * @param property - The form item property.
   * @param renderer - The rendering function for the form item.
   */
  public register(property: string, renderer: (props: F) => any): void {
    if (this.#itemMap.has(property)) {
      return;
    }

    this.#itemMap.set(property, renderer);
  }

  /**
   * Unregister a form item property.
   * @param property - The form item property to unregister.
   */
  public unRegister(property: string): void {
    if (!this.#itemMap.has(property)) {
      return;
    }

    this.#itemMap.delete(property);
  }

  /**
   * Get the rendering function for a specific form item property.
   * @param property - The form item property.
   * @returns The rendering function for the specified property.
   */
  public getItem(property: string): Render<F> {
    return this.#itemMap.get(property);
  }

  /**
   * Get all registered form item properties and their corresponding renderers.
   * @returns A map containing form item properties and their renderers.
   */
  public getItems(): Map<string, Render<F>> {
    return this.#itemMap;
  }

  /**
   * Get an iterable of all registered form item properties.
   * @returns An iterable of form item properties.
   */
  public getItemKeys(): IterableIterator<string> {
    return this.#itemMap.keys();
  }
}
