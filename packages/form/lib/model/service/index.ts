import { CommandService, FormItem } from '..';

/**
 * A service of a form. Register it with `@Services` and read it back with
 * `controller.getService(Class)`.
 */
export interface IService {
  /** A label for the service, shown by developer tools. */
  get name(): string;
}

/**
 * A service that reads or changes the form.
 */
export interface IServiceInitialize<E, F extends FormItem<E>> extends IService {
  /** Called once when the form is started. */
  initialize: (command: CommandService<E, F>) => void | Promise<void>;
}

/**
 * A service that is executed.
 */
export interface IServiceControl<T = unknown> extends IService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  run: (...args: any[]) => Promise<T>;
}

/**
 * A service that adds features to what the functions of form items receive.
 */
export interface IServiceCommand extends IService {
  addCustomFeaturesForCommandItem: () => Record<string, unknown>;
}

/**
 * The services `controller.getService` knows the types of. Packages add
 * theirs by declaration merging, which binds them to the entity of the form:
 *
 * declare module '@punica/form' {
 *   interface ServiceRegistry<E, F> { myService: MyService<E, F> }
 * }
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ServiceRegistry<
  E,
  // @ts-expect-error The parameters are used by the declarations merged into the interface
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  F extends FormItem<E>
> {}
