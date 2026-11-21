import { CommandService, FormItem, IServiceInitialize } from '@punica/form';
import {
  FormRow,
  createLists,
  insertRow,
  moveRow,
  removeRow,
  replaceRows,
  rowsOf
} from '../rows';
import { Validate } from '../validate';

/** The properties of an entity that hold a list of rows. */
export type ListProperty<E> = {
  [K in keyof E]-?: NonNullable<E[K]> extends ReadonlyArray<object> ? K : never;
}[keyof E];

/** The entity of the rows of a list. */
export type RowOf<E, K extends keyof E> =
  NonNullable<E[K]> extends ReadonlyArray<infer R extends object> ? R : never;

/**
 * Lists of rows, such as the lines of an invoice. Every row is a form of its
 * own, created from the entity the `row` function of the form item returns:
 *
 * const { rows, controller } = ...
 * const lines = controller.getService(FieldArray);
 * await lines.append('lines', { name: 'Paper' });
 * lines.rows('lines')[0].controller.getService(SetValue).run('price', 5);
 *
 * The value of the item is the array of the values of its rows. The item is
 * dirty, touched and in error when a row is, and validating the form
 * validates the rows. A row class without `@Services` gets the services of
 * the form around it.
 */
export class FieldArray<
  E,
  F extends FormItem<E> = FormItem<E>
> implements IServiceInitialize<E, F> {
  #command!: CommandService<E, F>;

  public get name(): string {
    return 'fieldArray';
  }

  public async initialize(command: CommandService<E, F>): Promise<void> {
    this.#command = command;

    await createLists(command, Validate);
  }

  /**
   * The rows of a list. The array is replaced when a row is added, removed
   * or moved and stays the same while only values change.
   * @throws When the item of the property is not a list
   */
  public rows<
    K extends ListProperty<E>,
    RF extends FormItem<RowOf<E, K>> = FormItem<RowOf<E, K>>
  >(property: K): ReadonlyArray<FormRow<RowOf<E, K>, RF>> {
    return rowsOf(this.#command, property) as ReadonlyArray<
      FormRow<RowOf<E, K>, RF>
    >;
  }

  /**
   * Adds a row at the end of a list.
   * @param value - Values of the row that replace the ones of its class
   * @returns The row
   */
  public append<K extends ListProperty<E>>(
    property: K,
    value?: Partial<RowOf<E, K>>
  ): Promise<FormRow<RowOf<E, K>>> {
    return insertRow(this.#command, property, value) as unknown as Promise<
      FormRow<RowOf<E, K>>
    >;
  }

  /** Adds a row at an index of a list. */
  public insert<K extends ListProperty<E>>(
    property: K,
    index: number,
    value?: Partial<RowOf<E, K>>
  ): Promise<FormRow<RowOf<E, K>>> {
    return insertRow(
      this.#command,
      property,
      value,
      index
    ) as unknown as Promise<FormRow<RowOf<E, K>>>;
  }

  /** Removes a row from a list: the row itself or the one at an index. */
  public remove<K extends ListProperty<E>>(
    property: K,
    row: FormRow<RowOf<E, K>> | number
  ): Promise<void> {
    return removeRow(this.#command, property, row);
  }

  /** Moves the row at an index of a list to another index. */
  public move<K extends ListProperty<E>>(
    property: K,
    from: number,
    to: number
  ): Promise<void> {
    return moveRow(this.#command, property, from, to);
  }

  /** Replaces the rows of a list by rows for the values. */
  public replace<K extends ListProperty<E>>(
    property: K,
    values: Array<Partial<RowOf<E, K>>>
  ): Promise<void> {
    return replaceRows(this.#command, property, values);
  }
}
