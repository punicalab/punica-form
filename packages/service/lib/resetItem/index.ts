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
  public initialize(command: CommandService<E, F>) {
    this.#command = command;
  }

  /**
   * Resets the value of the specified property.
   * @param {keyof E} property - The name of the property to reset.
   * @returns {Promise} - Resolves when the operation is complete, rejects on error.
   */
  public run(property: keyof E): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        const { fireEvent, itemsMap, formData, initialFormData } =
          this.#command;
        const itemIndex = itemsMap[property];
        const oldFormItem = initialFormData.items[itemsMap[property]];

        if (itemIndex !== undefined && oldFormItem !== undefined) {
          formData.items[itemIndex] = deepCopy(oldFormItem);

          fireEvent('UPDATE_FORM', formData);

          resolve();
        } else {
          reject(new Error('Unexpected condition'));
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
