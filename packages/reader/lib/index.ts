import { Reader } from './reader';
import { IReader } from '@punica/form-model';
import {
  ChapterReader,
  ConverterReader,
  DataReader,
  ItemsReader,
  DisabledReader,
  HiddenReader,
  ItemLayoutReader,
  StartupReader
} from './decorators/readers';

const createReader = (): IReader<any, any> => {
  const reader = new Reader();

  const itemsReader = new ItemsReader(reader);
  const chapterReader = new ChapterReader(itemsReader);
  const dataReader = new DataReader(chapterReader);
  const converterReader = new ConverterReader(dataReader);
  const disabledReader = new DisabledReader(converterReader);
  const hiddenReader = new HiddenReader(disabledReader);
  const itemLayoutReader = new ItemLayoutReader(hiddenReader);
  const startupReader = new StartupReader(itemLayoutReader);

  return startupReader;
};

export default createReader;
