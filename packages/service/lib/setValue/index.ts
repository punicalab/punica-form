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
  private setValue = async (property: keyof E, value: any): Promise<void> => {
    const { form, getItem, writeItems, fireEvent, createCommandItem } =
      this.#command;
    const formItem = getItem(property);

    if (!formItem) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    formItem.value = value;

    // Items changed by the control function of the form item, if any
    const controlledItems = formItem.control
      ? await formItem.control(await createCommandItem(formItem))
      : [];

    await writeItems(controlledItems);

    fireEvent('UPDATE_ITEM', [formItem, ...controlledItems]);
    fireEvent('UPDATE_FORM', form);
  };

  /**
   * Initializes the service with a command.
   * @param command - The command service to be used.
   */
  public async initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    for (const item of command.form.items) {
      item.setValue = this.setValue;
    }
  }
}
