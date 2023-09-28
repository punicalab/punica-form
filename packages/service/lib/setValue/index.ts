import { CommandService, FormItem, IServiceInitialize } from '@punica/form';

/**
 *
 */
export class SetValue<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>
{
  #command: CommandService<E, F> = null;
  #name: string = 'setValue';

  /**
   *
   * @returns
   */
  public get name() {
    return this.#name;
  }

  /**
   *
   * @param property
   * @param value
   */
  private async setValue(property: keyof E, value: any) {
    const { formData, getItem, writeItems, fireEvent, createCommandItem } =
      this.#command;
    const formItem = getItem(property) as F;
    const { control } = formItem;

    formItem.value = value;

    writeItems([formItem]);

    if (control) {
      const command = await createCommandItem(formItem);

      control(command).then((formItems: any) => {
        writeItems(formItems);
        fireEvent('UPDATE_ITEM', [formItem, ...formItems]);
        fireEvent('UPDATE_FORM', formData);
      });
    } else {
      fireEvent('UPDATE_ITEM', [formItem]);
      fireEvent('UPDATE_FORM', formData);
    }
  }

  /**
   *
   * @param command
   */
  public async initialize(command: CommandService<E, F>) {
    this.#command = command;

    const { formData } = command;

    for await (const item of formData.items) {
      item.setValue = this.setValue;
    }
  }
}
