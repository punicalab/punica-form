import { IReader } from '..';
import { Reader } from './reader';
import {
  FormItemsReader,
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
  const itemInitializerReader = new ItemInitializerReader(itemDataReader);

  return itemInitializerReader;
};
