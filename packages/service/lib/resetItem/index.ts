import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
} from '@punica/form';

/**
 * Service for resetting form item values.
 */
export class ResetItem<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command: CommandService<E, F> = null;
  #name: string = 'resetItem';

  /**
   * Returns the name of the service.
   * @returns {string} - Service name
   */
  public get name(): string {
    return this.#name;
  }

  /**
   * Initializes the service with a command.
   * @param command - The command service to be used.
   */
  public initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    return Promise.resolve();
  }

  /**
   * Resets the value of the specified property.
   * @param {keyof E} property - The name of the property to reset.
   * @returns {Promise} - Resolves when the operation is complete, rejects on error.
   */
  public async run(property: keyof E): Promise<void> {
    const { fireEvent, itemsMap, form, initialForm } = this.#command;
    const itemIndex = itemsMap[property];
    const initialItem = initialForm.items[itemIndex];

    if (!initialItem) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    form.items[itemIndex] = deepCopy(initialItem);

    fireEvent('UPDATE_FORM', form);
  }
}
