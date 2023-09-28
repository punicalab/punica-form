import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class ResetItem<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'resetItem';

  /**
   *
   * @returns
   */
  public get name() {
    return this.#name;
  }

  /**
   *
   * @param command
   */
  public initialize(command: CommandService<E, F>) {
    this.#command = command;
  }

  /**
   *
   * @returns
   */
  public run(property: keyof E) {
    return new Promise(() => {
      const { fireEvent, itemsMap, formData, initialFormData } = this.#command;
      const itemIndex = itemsMap[property];
      const oldFormItem = initialFormData.items[itemsMap[property]];

      formData.items[itemIndex] = { ...oldFormItem };

      fireEvent('UPDATE_FORM', formData);
    });
  }
}
