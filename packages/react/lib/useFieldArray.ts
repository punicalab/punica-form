import { useMemo, useSyncExternalStore } from 'react';
import { FormController, FormItem } from '@punica/form';
import { FieldArray, FormRow, ListProperty, RowOf } from '@punica/form-service';

/** A list of a form and the functions that change it. */
export type FieldArrayState<
  R extends object,
  F extends FormItem<R> = FormItem<R>
> = {
  /**
   * The rows of the list, each with a `key` for React and the `controller`
   * of its form. The array is replaced when a row is added, removed or
   * moved, not when a value changes.
   */
  rows: ReadonlyArray<FormRow<R, F>>;

  /** Adds a row at the end; the values replace the ones of the row class. */
  append: (value?: Partial<R>) => Promise<FormRow<R>>;

  /** Adds a row at an index. */
  insert: (index: number, value?: Partial<R>) => Promise<FormRow<R>>;

  /** Removes a row: the row itself or the one at an index. */
  remove: (row: FormRow<R> | number) => Promise<void>;

  /** Moves the row at an index to another index. */
  move: (from: number, to: number) => Promise<void>;

  /** Replaces the rows by rows for the values. */
  replace: (values: Array<Partial<R>>) => Promise<void>;
};

/**
 * A list of rows of a form, such as the lines of an invoice. The component
 * renders again when a row is added, removed or moved; a value that changes
 * renders the components that follow the form of that row, with `useForm`.
 *
 * const { rows, append, remove } = useFieldArray(controller, 'lines');
 *
 * rows.map((row) => <Line key={row.key} controller={row.controller} />)
 *
 * The form has to list the `FieldArray` service.
 * @param property - The property of the list
 */
export const useFieldArray = <
  E extends object,
  F extends FormItem<E>,
  K extends ListProperty<E>,
  RF extends FormItem<RowOf<E, K>> = FormItem<RowOf<E, K>>
>(
  controller: FormController<E, F>,
  property: K
): FieldArrayState<RowOf<E, K>, RF> => {
  const list = controller.getService(FieldArray) as unknown as FieldArray<E, F>;
  const getRows = () => list.rows<K, RF>(property);
  const rows = useSyncExternalStore(controller.subscribe, getRows, getRows);
  const changes = useMemo(
    () => ({
      append: (value?: Partial<RowOf<E, K>>) => list.append(property, value),
      insert: (index: number, value?: Partial<RowOf<E, K>>) =>
        list.insert(property, index, value),
      remove: (row: FormRow<RowOf<E, K>> | number) =>
        list.remove(property, row),
      move: (from: number, to: number) => list.move(property, from, to),
      replace: (values: Array<Partial<RowOf<E, K>>>) =>
        list.replace(property, values)
    }),
    [list, property]
  );

  return useMemo(() => ({ rows, ...changes }), [rows, changes]);
};
