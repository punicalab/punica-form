import { shared } from '../shared';

/**
 * What renders the items of a form item type. Punica Form is headless: it
 * stores renderers for the application and never calls them.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Renderer = (props: any) => any;

/**
 * The renderers of the form item types, by type.
 */
export class FormItemRegister {
  #items = new Map<string, Renderer>();

  /**
   * Registers the renderer of a type. The first registration of a type wins.
   */
  public register(type: string, renderer: Renderer): void {
    if (!this.#items.has(type)) {
      this.#items.set(type, renderer);
    }
  }

  public unregister(type: string): void {
    this.#items.delete(type);
  }

  /** The renderer of a type. */
  public getItem(type: string): Renderer | undefined {
    return this.#items.get(type);
  }

  /** The registered types. */
  public getItemKeys(): string[] {
    return [...this.#items.keys()];
  }
}

/**
 * Creates a register of its own, for tests or for an application that hosts
 * more than one form system.
 */
export const createFormItemRegister = (): FormItemRegister => {
  return new FormItemRegister();
};

/**
 * The register `defineFormItem` and `FormController` use unless they are
 * given another one.
 */
export const defaultFormItemRegister = (shared.register ??=
  createFormItemRegister());
