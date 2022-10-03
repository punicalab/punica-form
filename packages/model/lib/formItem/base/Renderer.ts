import { IFormItem } from '..';

export type Renderer = <F extends IFormItem>(props: F) => any;
