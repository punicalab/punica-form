import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 *
 */
export class GetValues<E, F extends FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl<E>
{
  #command: CommandService<E, F> = null;
  #name: string = 'getValues';

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
  public run() {
    return new Promise<E>(async (resolve) => {
      const { formData, initialEntity } = this.#command;
      const entity = { ...initialEntity };

      for await (const item of formData.items) {
        const { property, value } = item;

        entity[property] = value;
      }

      resolve(entity);
    });
  }
}
