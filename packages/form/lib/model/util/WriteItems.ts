import { FormItem } from '..';

export type WriteItems = <E>(items: Array<FormItem<E>>) => Promise<void>;
