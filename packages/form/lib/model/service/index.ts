import { CommandService, FormItem } from '..';

type CustomCommandItem = { [key: string]: any };

export interface IService {
  get name(): string;
}

export interface IServiceControl<E, F extends FormItem<E>> extends IService {
  initialize: (command: CommandService<E, F>) => void;
  run: <T>(...args: any[]) => Promise<T>;
}

export interface IServiceAddCommand extends IService {
  addCustomFeaturesForCommandItem: () => CustomCommandItem;
}
