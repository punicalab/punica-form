import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize,
  deepCopy
} from '@punica/form';

/**
 * Resets one item to the state it was started with.
 */
export class ResetItem<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'resetItem';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * @throws When the form has no item for the property
   */
  public async run(property: keyof E): Promise<void> {
    const initial = this.#command
      .getInitialItems()
      .find((item) => item.property === property);

    if (!initial) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    this.#command.supersede(property);
    this.#command.setItems([deepCopy(initial)]);
  }
}
