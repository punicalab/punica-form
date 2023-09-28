import { CommandService, FormItem } from '..';

export interface IService {
  get name(): string;
}

export interface IServiceInitialize<E, F extends FormItem<E>> extends IService {
  initialize: (command: CommandService<E, F>) => void;
}

export interface IServiceControl<T = any> extends IService {
  run: (...args: any[]) => Promise<T>;
}

export interface IServiceAddCommand extends IService {
  addCustomFeaturesForCommandItem: () => { [key: string]: any };
}
