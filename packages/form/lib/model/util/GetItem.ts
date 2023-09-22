import { FormItem } from '..';

export type GetItem<E, F extends FormItem<E>> = (property: keyof E) => F;
