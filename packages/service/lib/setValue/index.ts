import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { hasRows, replaceRows } from '../rows';
import { dropValidations } from '../validateItem';

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
   * The value of a list replaces its rows.
   * @throws When the form has no item for the property
   */
  public async run(property: keyof E, value: unknown): Promise<void> {
    const { getItem, setItems, supersede, emit, createCommandItem } =
      this.#command;
    if (!getItem(property)) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    // The rows of a list hold its value
    if (hasRows(this.#command, property)) {
      await replaceRows(this.#command, property, value);
      value = getItem(property)?.value;
    }

    const item = getItem(property) as F;

    // A validation of the old value is cancelled
    dropValidations(this.#command, property);

    const changed: F = item.validating
      ? { ...item, value, validating: false }
      : { ...item, value };
    const isCurrent = supersede(property);

    setItems([changed]);

    const controlled = changed.control
      ? ((await changed.control(createCommandItem(changed))) as F[])
      : [];

    if (!isCurrent()) {
      return;
    }

    // The control worked on copies from before it ran: what happened to the
    // items meanwhile (a field was left, a validation ended) is kept
    setItems(
      controlled.map((item) => {
        const { touched, validating } = getItem(item.property) ?? item;

        return { ...item, touched: touched || item.touched, validating };
      })
    );

    // Listeners get the items as the form holds them now
    emit(
      'UPDATE_ITEM',
      [changed, ...controlled].map((item) => getItem(item.property) ?? item)
    );
  }
}
