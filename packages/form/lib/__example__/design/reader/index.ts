import { IReader, Form } from '../../..';
import { DECORATOR_DESCRIPTION, DECORATOR_TITLE } from '../decorator';
import { BaseFormItem } from '../formItem';
import { DECORATOR_FORM_ITEM_LAYOUT } from '../formItemProperty';

/**
 *
 */
export class Reader<E extends Object, F extends BaseFormItem<E>>
  implements IReader<E, F>
{
  #form: Form<E, F>;
  #itemsMap: Record<keyof E, number>;

  /**
   *
   * @param entity
   * @returns
   */
  private readItemsLayout(entity: E): Promise<void> {
    return new Promise(async (resolve) => {
      const { items } = this.#form;
      const itemLayoutMap: any = Reflect.getMetadata(
        DECORATOR_FORM_ITEM_LAYOUT,
        entity
      );

      for await (const key of Object.keys(itemLayoutMap)) {
        const itemIndex = this.#itemsMap[key as keyof E];
        const item = items[itemIndex];

        items[itemIndex] = { ...item, layout: { ...itemLayoutMap[key] } };
      }

      resolve();
    });
  }

  /**
   *
   * @param entity
   * @returns
   */
  public read(
    entity: E,
    initialForm: Form<E, F>,
    itemsMap: Record<keyof E, number>
  ): Promise<void> {
    return new Promise(async () => {
      this.#form = initialForm;
      this.#itemsMap = itemsMap;
      this.#form.title = Reflect.getMetadata(DECORATOR_TITLE, entity as E);

      this.#form.description = Reflect.getMetadata(
        DECORATOR_DESCRIPTION,
        entity as E
      );

      await this.readItemsLayout(entity);
    });
  }
}
