import { FormItem, IService } from '../..';

export type Form<E, F extends FormItem<E>> = {
  items?: Array<F>;
  services?: Array<IService>;

  [key: string]: any;
};
