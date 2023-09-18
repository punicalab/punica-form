import { IFormItem, IService } from '../..';
import { Initializer } from '..';

export type Form<F extends IFormItem> = {
  items?: Array<F>;
  store?: Record<string, any>;
  initializer?: Initializer;
  services?: IService;

  [key: string]: any;
};
