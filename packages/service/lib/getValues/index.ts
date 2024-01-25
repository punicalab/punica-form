import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Service for retrieving form values as an entity.
 */
export class GetValues<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<E>
{
  #command: CommandService<E, F> = null;
  #name: string = 'getValues';

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
   * Retrieves form values and returns them as an entity.
   * @returns {Promise<E>} - Resolves with the entity containing form values.
   */
  public run(): Promise<E> {
    return new Promise<E>(async (resolve) => {
      const { formData, initialEntity } = this.#command;

      // Create a copy of the initial entity
      const entity = { ...initialEntity };

      // Iterate through form items to extract values
      for await (const item of formData.items) {
        const { property, value } = item;

        // Assign the form value to the corresponding entity property
        entity[property] = value;
      }

      // Resolve the entity with form values
      resolve(entity);
    });
  }
}
