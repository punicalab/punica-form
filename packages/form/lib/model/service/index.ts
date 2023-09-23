import { CommandService, FormItem } from '..';

export interface IService<E, F extends FormItem<E>> {
  initialize: (command: CommandService<E, F>) => void;
  run: <T>() => Promise<T>;
  name: () => string;
}
