import { IReader } from '..';
import { Reader } from './reader';
import {
  FormItemsReader,
  ItemConverterReader,
  ItemDataReader,
  ItemInitializerReader,
  ItemLayoutReader
} from './decorators/readers';

export const createInitialReader = (): IReader<any, any> => {
  const reader = new Reader();

  const formItemsReader = new FormItemsReader(reader);
  const itemDataReader = new ItemDataReader(formItemsReader);
  const itemConverterReader = new ItemConverterReader(itemDataReader);
  const itemLayoutReader = new ItemLayoutReader(itemConverterReader);
  const itemInitializerReader = new ItemInitializerReader(itemLayoutReader);

  return itemInitializerReader;
};
