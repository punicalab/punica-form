import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { clearRows, serviceOf } from '../rows';

/**
 * Clears the validation errors of every item.
 */
export class ClearErrors<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'clearErrors';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  public async run(): Promise<void> {
    const { getForm, setItems } = this.#command;

    // The rows of the lists first: their items follow from them
    const rows = clearRows(this.#command, undefined, (row) =>
      serviceOf(row, ClearErrors)?.run()
    );

    if (rows) await rows;

    setItems(
      getForm().items.map((item) => ({
        ...item,
        error: false,
        errorMessages: []
      }))
    );
  }
}
