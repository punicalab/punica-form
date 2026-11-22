import {
  CommandService,
  FormItem,
  IServiceControl,
  IServiceInitialize
} from '@punica/form';
import { hasRows, rowsOf, serviceOf, setListError } from '../rows';
import { noteExternalError } from '../validateItem';

/**
 * Messages by item, as a server sends them for what it refused. A name is a
 * property of the form; `lines.1.price` (or `lines[1].price`) is the item
 * `price` of the second row of the list `lines`. Nested objects and arrays
 * say the same: `{ lines: [{}, { price: ['Too high'] }] }`.
 */
export type ItemErrors = {
  readonly [name: string]: string | readonly string[] | ItemErrors | unknown;
};

/** A message and the item it is about, as the parts of its name. */
type Entry = { parts: string[]; message: string };

/** The parts of a name: `lines[1].price` is `lines`, `1`, `price`. */
const partsOf = (name: string): string[] =>
  name
    .replace(/\[(\w+)\]/g, '.$1')
    .split('.')
    .map((part) => part.trim())
    .filter((part) => part !== '');

/**
 * Every message of what was given, with where it belongs, in the order it
 * is written. A text or a number is a message; a list of them is several;
 * an object or a list of objects goes one level further down. Anything else
 * says nothing and is left out.
 */
const read = (value: unknown, parts: string[], entries: Entry[]): void => {
  if (typeof value === 'string') {
    if (value !== '') entries.push({ parts, message: value });
  } else if (typeof value === 'number') {
    entries.push({ parts, message: String(value) });
  } else if (Array.isArray(value)) {
    value.forEach((one, index) =>
      read(
        one,
        one !== null && typeof one === 'object'
          ? [...parts, String(index)]
          : parts,
        entries
      )
    );
  } else if (value !== null && typeof value === 'object') {
    for (const name of Object.keys(value)) {
      read(
        (value as Record<string, unknown>)[name],
        [...parts, ...partsOf(name)],
        entries
      );
    }
  }
};

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
 * An error set this way replaces the messages its item had. It goes when
 * the item is validated again (`Trigger`, `Validate`, `Submit`), also when
 * the item has no validation of its own, and with `ClearError`,
 * `ClearErrors`, `ResetItem` and `Reset`. A validation that was running
 * when the error was set does not erase it.
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
   * @param errors - Messages by item: see `ItemErrors`. What is no object
   * of messages (a text, `null`) names no item
   * @returns The messages that are about no item of the form, to be shown
   * for the form as a whole; those of a row stand where the row was first
   * named
   */
  public async run(errors: ItemErrors | unknown): Promise<string[]> {
    const { getItem, setItems } = this.#command;
    const entries: Entry[] = [];

    read(errors, [], entries);

    /** Messages by item of this form. */
    const own = new Map<keyof E, string[]>();
    /** What each row is told, once. */
    const rows = new Map<
      { run: (errors: unknown) => Promise<string[]> },
      { errors: Record<string, string[]>; rest: string[] }
    >();
    /** What names no item, in order; a row holds the place of its own. */
    const rest: Array<string | { rest: string[] }> = [];
    const add = <K>(map: Map<K, string[]>, key: K, message: string) =>
      map.set(key, [...(map.get(key) ?? []), message]);

    for (const { parts, message } of entries) {
      const [first, index, ...inside] = parts;
      const property = first as keyof E;

      if (first === undefined || !getItem(property)) {
        rest.push(message);
        continue;
      }

      // The item itself
      if (index === undefined) {
        add(own, property, message);
        continue;
      }

      const row =
        hasRows(this.#command, property) && /^\d+$/.test(index)
          ? rowsOf(this.#command, property)[Number(index)]
          : undefined;
      const service = row && serviceOf(row, SetErrors);

      if (!service) {
        // Not a list, no such row, or a row that cannot show it
        rest.push(message);
      } else if (inside.length === 0) {
        // About the row as a whole: the list is where it can be shown
        add(own, property, message);
      } else {
        let told = rows.get(service);

        if (!told) {
          told = { errors: {}, rest: [] };
          rows.set(service, told);
          rest.push(told);
        }

        const name = inside.join('.');

        told.errors[name] = [...(told.errors[name] ?? []), message];
      }
    }

    // The rows first: the item of a list follows from them
    for (const [service, told] of rows) {
      told.rest.push(...(await service.run(told.errors)));
    }

    const items: F[] = [];

    for (const [property, messages] of own) {
      // What a validation that is running finds was asked before this
      noteExternalError(this.#command, property);

      if (!setListError(this.#command, property, messages)) {
        items.push({
          ...(getItem(property) as F),
          error: true,
          errorMessages: messages
        });
      }
    }

    if (items.length) setItems(items);

    return rest.flatMap((one) => (typeof one === 'string' ? [one] : one.rest));
  }
}
