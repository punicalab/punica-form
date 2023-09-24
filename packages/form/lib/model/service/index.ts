import { CommandService, FormItem } from '..';

type CustomCommandItem = { [key: string]: any };

export interface IService {
  get name(): string;

  [key: string]: any;
}

export interface IServiceControl<E, F extends FormItem<E>> {
  initialize: (command: CommandService<E, F>) => void;
  run: <T>(...args: any[]) => Promise<T>;
}

export interface IServiceAddCommand {
  addCustomFeaturesForCommandItem: () => CustomCommandItem;
}
