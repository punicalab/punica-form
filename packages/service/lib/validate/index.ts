import {
  CommandService,
  ErrorDetail,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { validateItem, writeResults } from '../validateItem';

/**
 * Validates every item of the form.
 */
export class Validate<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'validate';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * @returns Whether every validated item is valid
   */
  public async run(): Promise<boolean> {
    const results = new Map<keyof E, ErrorDetail>();

    for (const item of this.#command.getForm().items) {
      const result = await validateItem(this.#command, item);

      if (result) results.set(item.property, result);
    }

    writeResults(this.#command, results);

    return [...results.values()].every((result) => !result.error);
  }
}
