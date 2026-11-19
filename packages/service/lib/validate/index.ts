import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { validateItem } from '../validateItem';

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
    const validated: F[] = [];

    for (const item of this.#command.getForm().items) {
      const result = await validateItem(this.#command, item);

      if (result) validated.push(result);
    }

    this.#command.setItems(validated);

    return validated.every((item) => !item.error);
  }
}
