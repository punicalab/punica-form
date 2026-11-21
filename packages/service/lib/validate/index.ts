import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { validateForm } from '../formValidation';
import { validateItems } from '../validateItem';

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
   * @returns Whether every validated item is valid, and the form as a
   * whole when it has validations of its own (`addFormValidation`)
   */
  public async run(): Promise<boolean> {
    const items = await validateItems(
      this.#command,
      this.#command.getForm().items
    );
    const form = await validateForm(this.#command);

    return items && form;
  }
}
