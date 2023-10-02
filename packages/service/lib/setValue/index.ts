import { CommandService, FormItem, IServiceInitialize } from '@punica/form';

/**
 * Service for setting values of form items.
 */
export class SetValue<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>
{
  #command: CommandService<E, F> = null;
  #name: string = 'setValue';

  /**
   * Returns the name of the service.
   * @returns {string} - Service name
   */
  public get name(): string {
    return this.#name;
  }

  /**
   * Sets the value of a form item.
   * @param {keyof E} property  - Property of the form item
   * @param value - Value to be set
   */
  private async setValue(property: keyof E, value: any) {
    try {
      const { formData, getItem, writeItems, fireEvent, createCommandItem } =
        this.#command;

      const formItem = getItem(property) as F;
      const { control } = formItem;

      formItem.value = value;

      writeItems([formItem]);

      if (control) {
        const command = await createCommandItem(formItem);

        control(command).then((formItems: Array<FormItem<E>>) => {
          writeItems(formItems);

          fireEvent('UPDATE_ITEM', [formItem, ...formItems]);
          fireEvent('UPDATE_FORM', formData);
        });
      } else {
        fireEvent('UPDATE_ITEM', [formItem]);
        fireEvent('UPDATE_FORM', formData);
      }
    } catch (error) {
      // Handle the error
      console.error(error);
    }
  }

  /**
   * Initializes the service with a command.
   * @param command - The command service to be used.
   */
  public async initialize(command: CommandService<E, F>) {
    try {
      this.#command = command;

      const { formData } = command;

      for await (const item of formData.items) {
        item.setValue = this.setValue.bind(this); // Bind the context
      }
    } catch (error) {
      // Handle the error
      console.error(error);
    }
  }
}
