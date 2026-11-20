import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { validateItems } from '../validateItem';

/**
 * Validates one item of the form.
 */
export class Trigger<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'trigger';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * @throws When the form has no item for the property
   */
  public async run(property: keyof E): Promise<void> {
    const item = this.#command.getItem(property);

    if (!item) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    await validateItems(this.#command, [item]);
  }
}
