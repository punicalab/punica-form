import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { hasRows, rowsOf, serviceOf } from '../rows';

/**
 * Messages by item, as a server sends them for what it refused. A name is a
 * property of the form; `lines.1.price` (or `lines[1].price`) is the item
 * `price` of the second row of the list `lines`.
 */
export type ItemErrors = Record<string, string | readonly string[]>;

/** The parts of a name: `lines[1].price` is `lines`, `1`, `price`. */
const partsOf = (name: string): string[] =>
  name
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .filter((part) => part !== '');

const listOf = (messages: string | readonly string[]): string[] =>
  (typeof messages === 'string' ? [messages] : [...messages]).filter(
    (message) => typeof message === 'string' && message !== ''
  );

/**
 * Shows errors that were found outside the form, by a server for example,
 * on the items they are about.
 *
 * ```ts
 * try {
 *   await save(values);
 * } catch (error) {
 *   // { email: ['This email is already registered'], capacity: ['Full'] }
 *   const rest = await controller.getService(SetErrors).run(error.fields);
 *
 *   if (rest.length) throw new Error(rest.join(' ')); // shown by the form
 * }
 * ```
 *
 * An error set this way stays until its item is validated again, reset or
 * cleared, as an error of a validation does.
 */
export class SetErrors<E, F extends FormItem<E> = FormItem<E>>
  implements IServiceInitialize<E, F>, IServiceControl
{
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'setErrors';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
  }

  /**
   * Writes the messages onto the items they name. The rows of a list are
   * reached through their index.
   * @param errors - Messages by item
   * @returns The messages that are about no item of the form, in the order
   * they were given: show them for the form as a whole
   */
  public async run(errors: ItemErrors): Promise<string[]> {
    const { getItem, setItems } = this.#command;
    const rest: string[] = [];
    /** Messages by item of this form, several names may be about one. */
    const own = new Map<keyof E, string[]>();
    /** Messages by row and by what is left of the name. */
    const rows: Array<{ run: () => Promise<string[]> | undefined }> = [];

    for (const name of Object.keys(errors ?? {})) {
      const messages = listOf(errors[name]);

      if (!messages.length) continue;

      const [first, index, ...inside] = partsOf(name);
      const property = first as keyof E;

      if (first === undefined || !getItem(property)) {
        rest.push(...messages);
        continue;
      }

      // The item itself
      if (index === undefined) {
        own.set(property, [...(own.get(property) ?? []), ...messages]);
        continue;
      }

      const row =
        hasRows(this.#command, property) && /^\d+$/.test(index)
          ? rowsOf(this.#command, property)[Number(index)]
          : undefined;
      const service = row && serviceOf(row, SetErrors);

      if (!service) {
        // Not a list, no such row, or a row that cannot show it
        rest.push(...messages);
      } else if (inside.length === 0) {
        // About the row as a whole: the list is where it can be shown
        own.set(property, [...(own.get(property) ?? []), ...messages]);
      } else {
        rows.push({ run: () => service.run({ [inside.join('.')]: messages }) });
      }
    }

    // The rows first: the item of a list follows from them
    for (const row of rows) rest.push(...((await row.run()) ?? []));

    if (own.size) {
      setItems(
        [...own].map(
          ([property, messages]) =>
            ({
              ...(getItem(property) as F),
              error: true,
              errorMessages: messages
            }) as F
        )
      );
    }

    return rest;
  }
}
