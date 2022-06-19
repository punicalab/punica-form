import { IFormItem } from '.';

export type ReadItems = <F extends IFormItem>(
  properties: Array<string>
) => Map<string, F>;
