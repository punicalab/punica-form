import { FormItem, IService } from '../..';

export type Form<E, F extends FormItem<E>> = {
  items?: Array<F>;
  services?: Array<IService<E, F>>;

  [key: string]: any;
};
