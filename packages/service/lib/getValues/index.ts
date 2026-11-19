import { writeToPropertyPath } from '@punica/util';
import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
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
  public initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    return Promise.resolve();
  }

  /**
   * Retrieves form values and returns them as an entity.
   * @returns {Promise<E>} - Resolves with the entity containing form values.
   */
  public async run(): Promise<E> {
    const { form, initialEntity } = this.#command;

    // Deep copy so nested values of the initial entity are never mutated
    const entity = deepCopy(initialEntity);

    for (const item of form.items) {
      const { property, value, path } = item;

      if (path) {
        writeToPropertyPath(entity, path, value);
      } else {
        entity[property] = value;
      }
    }

    return entity;
  }
}
