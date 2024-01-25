import { CommandService, Form, FormItem } from '..';

// Interface for defining a service.
export interface IService {
  // Returns the name of the service.
  get name(): string;
}

// Interface for services that require initialization.
export interface IServiceInitialize<E, F extends FormItem<E>> extends IService {
  // Initializes the service with a command.
  initialize: (command: CommandService<E, F>) => void;
}

// Interface for services that can be controlled or triggered.
export interface IServiceControl<T = any> extends IService {
  // Executes the service's main functionality.
  run: (...args: any[]) => Promise<T>;
}

// Interface for services that can add custom features to command items.
export interface IServiceCommand extends IService {
  // Returns custom features for a command item.
  addCustomFeaturesForCommandItem: () => { [key: string]: any };
}

// Interface for services that require startup actions.
export interface IServiceStartup<E, F extends FormItem<E>> extends IService {
  // Starts the service with initial entity and form data.
  start: (entity: E, form: Form<E, F>) => { [key: string]: any };
}
