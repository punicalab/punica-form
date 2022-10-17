import { IEntity } from '@punica/common';
import BaseReader from '../base';
import {
  IForm,
  IFormItem,
  IFormChapterMap,
  DECORATOR_CHAPTER
} from '@punica/form';

class Reader<E extends IEntity, F extends IFormItem> extends BaseReader<E, F> {
  /**
   *
   * @param entity
   * @returns
   */
  private readItem(entity: E): Promise<IFormChapterMap> {
    return new Promise((resolve) => {
      const chapters = Reflect.getMetadata(DECORATOR_CHAPTER, entity);

      resolve(chapters);
    });
  }

  /**
   *
   * @param entity
   * @returns
   */
  public async read(entity: E): Promise<IForm<F>> {
    const form: IForm<F> = await super.read(entity);
    form.chapterMap = await this.readItem(entity);

    return form;
  }
}

export default Reader;
