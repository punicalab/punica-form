import { ErrorDetail, FormItem } from '@punica/form';

/** A choice of a select: its value, or its value and the text to show. */
export type Option = string | { value: string; label: string };

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

    /** The choices of a select. */
    options?: Option[];

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
};

/** A validation of an item. */
export type Validation = NonNullable<FieldProps['validation']>;

export type { ErrorDetail };
