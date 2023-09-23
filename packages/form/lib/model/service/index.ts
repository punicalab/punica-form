import { CommandService, FormItem } from '..';

type CustomCommandItem = { [key: string]: any };

export interface IService<E, F extends FormItem<E>> {
  initialize: (command: CommandService<E, F>) => void;
  run: <T>() => Promise<T>;
  getItemCommand?: () => CustomCommandItem;
  get name(): string;
}
