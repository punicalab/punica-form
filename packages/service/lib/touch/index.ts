import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Marks an item as touched: the user has left its field.
 */
export class Touch<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'touch';
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

    if (!item.touched) {
      this.#command.setItems([{ ...item, touched: true }]);
    }
  }
}
