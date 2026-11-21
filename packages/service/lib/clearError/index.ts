import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { ClearErrors } from '../clearErrors';
import { clearRows, serviceOf } from '../rows';

/**
 * Clears the validation error of one item.
 */
export class ClearError<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'clearError';
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

    // The rows of a list first: its item follows from them
    await clearRows(this.#command, property, (row) =>
      serviceOf(row, ClearErrors)?.run()
    );

    this.#command.setItems([
      {
        ...(this.#command.getItem(property) ?? item),
        error: false,
        errorMessages: []
      }
    ]);
  }
}
