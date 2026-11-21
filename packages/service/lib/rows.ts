import {
  CommandService,
  ErrorDetail,
  FormController,
  FormItem,
  IService,
  deepCopy,
  isEqual
} from '@punica/form';
import { valuesOf } from './readValues';

/**
 * A row of a list: a form of its own. `key` identifies the row for as long
 * as it is part of the list, wherever it is moved to.
 */
export type FormRow<
  R extends object = object,
  F extends FormItem<R> = FormItem<R>
> = {
  key: string;
  controller: FormController<R, F>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = FormRow<any, any>;

/** What a list knows about one of its rows. */
type Detail = {
  /** The entity the row was created from. */
  entity: object;

  /** The values of the row as the item of the list holds them. */
  value: object;

  /** Ends following the row. */
  off: () => void;
};

type List = {
  /** A new array whenever a row is added, removed or moved. */
  rows: readonly AnyRow[];

  /** Rows that changed since the item of the list was written. */
  stale: Set<AnyRow>;

  /** The last result of the validation of the item itself. */
  own?: ErrorDetail;
};

/** The lists of a form. */
type Lists = {
  byProperty: Map<PropertyKey, List>;

  /** While above zero the items of the lists are not written. */
  paused: number;

  /** The changes of the lists run one after the other, in call order. */
  queue: Promise<unknown>;
};

const forms = new WeakMap<object, Lists>();
const details = new WeakMap<AnyRow, Detail>();

let rowCount = 0;

const listsOf = (command: object): Lists => {
  const found = forms.get(command) ?? {
    byProperty: new Map(),
    paused: 0,
    queue: Promise.resolve()
  };

  forms.set(command, found);

  return found;
};

const detailOf = (row: AnyRow): Detail => details.get(row) as Detail;

/** The list of a property; `undefined` when its item is not a list. */
const listOf = (command: object, property: PropertyKey): List | undefined => {
  return forms.get(command)?.byProperty.get(property);
};

/** Whether the item of a property is a list whose rows were created. */
export const hasRows = (command: object, property: PropertyKey): boolean => {
  return listOf(command, property) !== undefined;
};

/** The properties of the lists of a form. */
export const listProperties = (command: object): PropertyKey[] => {
  return [...(forms.get(command)?.byProperty.keys() ?? [])];
};

/**
 * The rows of a list.
 * @throws When the item of the property is not a list
 */
export const rowsOf = (
  command: object,
  property: PropertyKey
): readonly AnyRow[] => {
  const list = listOf(command, property);

  if (!list) {
    throw new Error(
      `Not a list: ${String(property)}. Give its form item a row and add FieldArray to @Services.`
    );
  }

  return list.rows;
};

/** Runs a change of the lists of a form after the ones started before it. */
const enqueue = <T>(command: object, change: () => Promise<T>): Promise<T> => {
  const lists = listsOf(command);
  const result = lists.queue.then(change);

  // A change that fails does not hold up the next one
  lists.queue = result.catch(() => undefined);

  return result;
};

const readRow = (row: AnyRow): object => {
  return valuesOf(detailOf(row).entity, row.controller.getForm().items);
};

/**
 * Writes what the rows of a list say onto its item: their values and
 * whether they are valid, touched or being validated.
 * @param all - Write the item although no row changed, after rows were
 * added, removed or moved
 */
const write = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  all = false
): void => {
  const list = listOf(command, property);
  const item = command.getItem(property);

  if (!list || !item || listsOf(command).paused) return;

  for (const row of list.stale) {
    const detail = details.get(row);
    const value = detail && readRow(row);

    // An unchanged row keeps its value object, so the array below stays
    if (detail && !isEqual(value, detail.value)) {
      detail.value = value as object;
    }
  }

  list.stale.clear();

  const current: unknown[] = Array.isArray(item.value) ? item.value : [];
  const values = list.rows.map((row) => detailOf(row).value);
  const same =
    !all &&
    values.length === current.length &&
    values.every((value, index) => value === current[index]);
  const states = list.rows.map((row) => row.controller.getForm().state);
  const next = {
    error: Boolean(list.own?.error) || states.some((state) => !state?.valid),
    touched: states.some((state) => state?.touched),
    validating: states.some((state) => state?.validating)
  };

  if (
    same &&
    next.error === Boolean(item.error) &&
    next.touched === Boolean(item.touched) &&
    next.validating === Boolean(item.validating)
  ) {
    return;
  }

  command.setItems([
    {
      ...item,
      ...next,
      value: same ? item.value : values,
      errorMessages: list.own ? (list.own.errorMessages ?? []) : []
    }
  ]);
};

/** Creates a row and starts its form. It is not part of a list yet. */
const createRow = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  item: F,
  value?: object
): Promise<AnyRow> => {
  const entity = (item.row as NonNullable<F['row']>)() as Record<
    string,
    unknown
  >;

  for (const [key, entry] of Object.entries(deepCopy(value ?? {}))) {
    entity[key] = entry;
  }

  const controller = await FormController.fromEntity(entity, {
    name: String(item.property),
    // A row class without services of its own works like the form around it
    services: command
      .getForm()
      .services?.filter((service) => typeof service === 'function')
  });

  await controller.start();

  const row: AnyRow = { key: `row-${++rowCount}`, controller };

  details.set(row, { entity, value: {}, off: () => undefined });
  detailOf(row).value = readRow(row);

  return row;
};

/** Makes the rows the ones of the list; the rows it had are let go. */
const setRows = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  rows: AnyRow[]
): List => {
  const lists = listsOf(command);
  const list = lists.byProperty.get(property) ?? {
    rows: [],
    stale: new Set()
  };
  const kept = new Set(rows);

  for (const row of list.rows) {
    if (!kept.has(row)) {
      detailOf(row).off();
      list.stale.delete(row);
    }
  }

  for (const row of rows) {
    const detail = detailOf(row);

    detail.off();
    detail.off = row.controller.subscribe(() => {
      list.stale.add(row);
      write(command, property);
    });
  }

  list.rows = Object.freeze(rows);
  lists.byProperty.set(property, list);

  return list;
};

const createRows = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  item: F,
  values: unknown
): Promise<AnyRow[]> => {
  return Promise.all(
    (Array.isArray(values) ? values : []).map((value) =>
      createRow(command, item, value)
    )
  );
};

const itemOf = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E
): F => {
  const item = command.getItem(property);

  if (!item?.row) {
    throw new Error(
      `Not a list: ${String(property)}. Give its form item a row.`
    );
  }

  return item;
};

/**
 * Creates the rows of every list of a form from the values of their items.
 * @param validateRow - Validates a row; the validation of the item of a
 * list also validates its rows with it
 */
export const createLists = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  validateRow: (row: AnyRow) => Promise<boolean>
): Promise<void> => {
  const lists = listsOf(command);

  for (const item of command.getForm().items) {
    if (!item.row) continue;

    const { property, validation } = item;
    const list = setRows(
      command,
      property,
      await createRows(command, item, item.value)
    );

    command.setItems([
      {
        ...item,
        // What the rows hold, so the item and its rows start out the same
        value: list.rows.map((row) => detailOf(row).value),
        validation: async (commandItem, context) => {
          const own = await validation?.call(item, commandItem, context);
          let valid: boolean[];

          // The rows are validated as one: the item is written once
          lists.paused++;

          try {
            valid = await Promise.all(
              rowsOf(command, property).map(validateRow)
            );
          } finally {
            lists.paused--;
          }

          if (!context?.signal.aborted) {
            list.own = own;
            write(command, property);
          }

          return {
            error: Boolean(own?.error) || valid.includes(false),
            errorMessages: own?.errorMessages ?? []
          };
        }
      }
    ]);
  }
};

/**
 * Adds a row to a list.
 * @param index - Where; at the end when it is left out
 */
export const insertRow = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  value?: object,
  index?: number
): Promise<AnyRow> => {
  return enqueue(command, async () => {
    const row = await createRow(command, itemOf(command, property), value);
    const rows = [...rowsOf(command, property)];

    rows.splice(index ?? rows.length, 0, row);
    setRows(command, property, rows);
    write(command, property, true);

    return row;
  });
};

/** Removes a row from a list: the row itself or the one at an index. */
export const removeRow = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  row: AnyRow | number
): Promise<void> => {
  return enqueue(command, async () => {
    const rows = rowsOf(command, property);
    const removed = typeof row === 'number' ? rows[row] : row;

    if (!rows.includes(removed)) return;

    setRows(
      command,
      property,
      rows.filter((other) => other !== removed)
    );
    write(command, property, true);
  });
};

/** Moves the row at an index of a list to another one. */
export const moveRow = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  from: number,
  to: number
): Promise<void> => {
  return enqueue(command, async () => {
    const rows = [...rowsOf(command, property)];

    if (!rows[from] || !rows[to] || from === to) return;

    rows.splice(to, 0, ...rows.splice(from, 1));
    setRows(command, property, rows);
    write(command, property, true);
  });
};

/** Replaces the rows of a list by rows for the values. */
export const replaceRows = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E,
  values: unknown
): Promise<void> => {
  return enqueue(command, async () => {
    const rows = await createRows(command, itemOf(command, property), values);

    setRows(command, property, rows);
    write(command, property, true);
  });
};

/**
 * Brings the rows of a list, or of every list, back to the ones the form
 * was started with. The items are not written: the caller resets them.
 */
export const resetRows = <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property?: keyof E
): Promise<void> => {
  const properties = (
    property === undefined ? listProperties(command) : [property]
  ).filter((key) => hasRows(command, key)) as Array<keyof E>;

  if (!properties.length) return Promise.resolve();

  return enqueue(command, async () => {
    const initial = command.getInitialItems();
    const created = await Promise.all(
      properties.map(async (key) => {
        const item = initial.find((other) => other.property === key);

        return item ? createRows(command, item, item.value) : [];
      })
    );

    properties.forEach((key, index) => {
      setRows(command, key, created[index]).own = undefined;
    });
  });
};

/**
 * The service of a class of the form of a row; `undefined` when the row
 * does not have it.
 */
export const serviceOf = <S extends IService>(
  row: AnyRow,
  service: new () => S
): S | undefined => {
  try {
    return row.controller.getService(service) as S;
  } catch {
    return undefined;
  }
};

/**
 * Clears the errors of the rows of a list, or of every list, of a form and
 * forgets the result of the validation of the items of the lists.
 * @param clear - Clears the errors of a row
 */
export const clearRows = async <E, F extends FormItem<E>>(
  command: CommandService<E, F>,
  property: keyof E | undefined,
  clear: (row: AnyRow) => unknown
): Promise<void> => {
  const lists = listsOf(command);
  const properties = (
    property === undefined ? listProperties(command) : [property]
  ).filter((key) => hasRows(command, key)) as Array<keyof E>;

  if (!properties.length) return;

  lists.paused++;

  try {
    await Promise.all(
      properties.flatMap((key) => rowsOf(command, key).map(clear))
    );
  } finally {
    lists.paused--;
  }

  for (const key of properties) {
    (listOf(command, key) as List).own = undefined;
    write(command, key);
  }
};
