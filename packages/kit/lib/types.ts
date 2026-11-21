import { ErrorDetail, FormItem } from '@punica/form';

/** A choice: its value, or its value and the text to show. */
export type Option = string | { value: string; label: string };

/**
 * The choices of a field: a list, or a function that loads one. The field
 * shows that it is loading and calls the function once, also when several
 * forms use it.
 */
export type Options = Option[] | (() => Promise<Option[]>);

/** How many columns of the form a field takes. */
export type Span = 1 | 2 | 3 | 4 | 'full';

/** The rules the kit validates by itself. */
export type Rules = {
  /** Fewest characters allowed. */
  minLength?: number;

  /** Most characters allowed. */
  maxLength?: number;

  /** What the value has to match. */
  pattern?: RegExp;

  /** Lowest number allowed. */
  min?: number;

  /** Highest number allowed. */
  max?: number;

  /** Earliest date allowed, as `yyyy-mm-dd`. */
  minDate?: string;

  /** Latest date allowed, as `yyyy-mm-dd`. */
  maxDate?: string;

  /** Fewest choices, files or rows allowed. */
  minItems?: number;

  /** Most choices, files or rows allowed. */
  maxItems?: number;

  /** The largest file allowed, in bytes. */
  maxFileSize?: number;
};

/**
 * The form item of the kit: a form item of Punica Form with what the kit's
 * components show and the rules it validates.
 */
export type KitItem<E> = FormItem<E> &
  Rules & {
    /** Text under the field. */
    help?: string;

    /** Shown while the field is empty. */
    placeholder?: string;

    /** The type of a text field, `text` by default. */
    inputType?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'date';

    /** The choices of a select, a multi-select or a radio group. */
    options?: Options;

    /** Shown in place of the choices while they are loaded, `Loading…` by default. */
    loadingText?: string;

    /** How the choices of a radio group are laid out, `vertical` by default. */
    orientation?: 'horizontal' | 'vertical';

    /** Whether a file field takes several files; its value is an array then. */
    multiple?: boolean;

    /** The files a file field takes, as the `accept` of a file input (`image/*,.pdf`). */
    accept?: string;

    /** The language a date field is typed and shown in, the one of the page by default. */
    locale?: string;

    /** The text of the button that adds a row to a list, `Add` by default. */
    addLabel?: string;

    /** The text of the button that removes a row from a list, `Remove` by default. */
    removeLabel?: string;

    /** Visible lines of a text area. */
    rows?: number;

    /** Columns the field takes in a form with several columns. */
    span?: Span;

    /** Messages of this field, in place of the kit's. */
    messages?: Partial<Messages>;
  };

/** What a field decorator takes: everything of an item but its property and type. */
// The entity is not known where a form class is decorated
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type FieldProps = Omit<KitItem<any>, 'property' | 'type'>;

/** The messages of the built-in rules. Each receives the label of the field. */
export type Messages = {
  required: (label: string) => string;
  minLength: (label: string, length: number) => string;
  maxLength: (label: string, length: number) => string;
  pattern: (label: string) => string;
  min: (label: string, value: number) => string;
  max: (label: string, value: number) => string;
  minDate: (label: string, date: string) => string;
  maxDate: (label: string, date: string) => string;
  minItems: (label: string, count: number) => string;
  maxItems: (label: string, count: number) => string;
  maxFileSize: (label: string, bytes: number) => string;
};

/** A validation of an item. */
export type Validation = NonNullable<FieldProps['validation']>;

export type { ErrorDetail };
