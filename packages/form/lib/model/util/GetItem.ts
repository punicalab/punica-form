import { IFormItem } from '..';

export type GetItem = <F extends IFormItem>(property: string) => F;
