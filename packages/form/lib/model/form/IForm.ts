import {
  IFormItem,
  IItemMap,
  IFormAction,
  Initializer,
  IFormChapterMap
} from '..';

export interface IForm<F extends IFormItem> {
  title: string;
  name: string;
  items?: Array<F>;
  actions?: Array<IFormAction>;
  description?: string;
  itemsMap?: IItemMap;
  chapterMap?: IFormChapterMap;
  initializer?: Initializer;
}
