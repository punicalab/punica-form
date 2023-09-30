import { IReader } from '..';
import { Reader } from './reader';
import {
  FormItemsReader,
  ItemDataReader,
  ItemInitializerReader
} from './decorators/readers';

/**
 * Decorator Design Pattern for a Reader System
 *
 * - The `IReader` interface defines the contract for all types of readers.
 * - The `Reader` class serves as the base reader.
 * - Decorators are implemented as classes (e.g., `FormItemsReader`, `ItemDataReader`, `ItemInitializerReader`) that wrap existing readers and enhance their behavior.
 * - The `createInitialReader` function creates an initial reader object with a chain of decorators applied.
 *
 * - `FormItemsReader` adds functionality related to reading form items.
 * - `ItemDataReader` adds functionality related to reading item data.
 * - `ItemInitializerReader` adds functionality related to initializing items.
 *
 * - The final `itemInitializerReader` returned by `createInitialReader` has all the decorators chained together,
 *   creating a powerful reader object that can perform a series of operations in a coordinated way.
 *
 * @returns {IReader<any, any>} - Initial reader object with a chain of decorators.
 */
export const createInitialReader = (): IReader<any, any> => {
  const reader = new Reader();

  const formItemsReader = new FormItemsReader(reader);
  const itemDataReader = new ItemDataReader(formItemsReader);
  const itemInitializerReader = new ItemInitializerReader(itemDataReader);

  return itemInitializerReader;
};
