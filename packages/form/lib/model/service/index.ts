import { CommandService, FormItem } from '..';

type CustomCommandItem = { [key: string]: any };

export interface IService<E, F extends FormItem<E>> {
  get name(): string;
  initialize?: (command: CommandService<E, F>) => void;
  getItemCommand?: () => CustomCommandItem;
  run?: <T>(...args: any[]) => Promise<T>;
}
