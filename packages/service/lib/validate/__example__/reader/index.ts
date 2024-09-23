import { IReader, FormItem } from '@punica/form';

/**
 *
 */
export class Reader<E, F extends FormItem<E>> implements IReader<E, F> {
  /**
   *
   * @param entity
   * @returns
   */
  public read(entity: E): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!entity) {
        reject();
      }

      resolve();
    });
  }
}
