import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { readValues } from '../readValues';

/**
 * Returns the entity with the values of the form.
 */
export class GetValues<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'getValues';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * @returns A copy of the entity the form was created from, holding the
   * current values. The entity itself is never changed.
   */
  public async run(): Promise<E> {
    return readValues(this.#command);
  }
}
