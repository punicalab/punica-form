import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { delayValidation, validateItems } from '../validateItem';

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
   * Waits for `validateDebounce` of the item first, when it has one; the
   * validation is skipped when the item is triggered again, validated,
   * changed or reset meanwhile.
   * @throws When the form has no item for the property
   */
  public async run(property: keyof E): Promise<void> {
    const { getItem } = this.#command;
    const item = getItem(property);

    if (!item) {
      throw new Error(`Item not found: ${String(property)}`);
    }

    if (
      item.validateDebounce &&
      !(await delayValidation(this.#command, property, item.validateDebounce))
    ) {
      return;
    }

    // The item as it is after the delay
    await validateItems(this.#command, [getItem(property) ?? item], {
      verdict: false
    });
  }
}
