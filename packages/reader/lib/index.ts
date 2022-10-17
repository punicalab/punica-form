import { Reader } from './reader';
import { IReader } from '@punica/form';
import {
  FormChapterReader,
  FormItemsReader,
  ItemConverterReader,
  ItemDataReader,
  ItemLayoutReader,
  ItemInitializerReader
} from './decorators/readers';

const createReader = (): IReader<any, any> => {
  const reader = new Reader();

  const formItemsReader = new FormItemsReader(reader);
  const formChapterReader = new FormChapterReader(formItemsReader);
  const itemDataReader = new ItemDataReader(formChapterReader);
  const itemConverterReader = new ItemConverterReader(itemDataReader);
  const itemLayoutReader = new ItemLayoutReader(itemConverterReader);
  const itemInitializerReader = new ItemInitializerReader(itemLayoutReader);

  return itemInitializerReader;
};

export default createReader;
