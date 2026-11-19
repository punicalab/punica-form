import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';

/**
 * Sets the value of an item and runs its control function.
 */
export class SetValue<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'setValue';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * Fires UPDATE_ITEM with the changed item and the items its control returned.
   * When the property is set again, or the form is reset, while the control
   * function is still running, the result of that older run is dropped.
   * @throws When the form has no item for the property
   */
  public async run(property: keyof E, value: unknown): Promise<void> {
    const { getItem, setItems, supersede, emit, createCommandItem } =
      this.#command;
    const item = getItem(property);

    if (!item) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    const changed: F = { ...item, value };
    const isCurrent = supersede(property);

    setItems([changed]);

    const controlled = changed.control
      ? ((await changed.control(createCommandItem(changed))) as F[])
      : [];

    if (!isCurrent()) {
      return;
    }

    setItems(controlled);
    emit('UPDATE_ITEM', [getItem(property) ?? changed, ...controlled]);
  }
}
