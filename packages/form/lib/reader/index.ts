import { IReader } from '..';
import { Reader } from './reader';
import {
  FormItemsReader,
  ItemConverterReader,
  ItemDataReader,
  ItemInitializerReader
} from './decorators/readers';

/**
 *
 * @returns
 */
export const createInitialReader = (): IReader<any, any> => {
  const reader = new Reader();

  const formItemsReader = new FormItemsReader(reader);
  const itemDataReader = new ItemDataReader(formItemsReader);
  const itemConverterReader = new ItemConverterReader(itemDataReader);
  const itemInitializerReader = new ItemInitializerReader(itemConverterReader);

  return itemInitializerReader;
};
