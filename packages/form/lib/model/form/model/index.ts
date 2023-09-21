import { IFormItem, IService } from '../..';
import { Initializer } from '..';

export type Form<F extends IFormItem> = {
  items?: Array<F>;
  store?: Record<string, any>;
  initializer?: Initializer;
  services?: Array<IService>;
  itemsMap?: Record<string, number>;

  [key: string]: any;
};
