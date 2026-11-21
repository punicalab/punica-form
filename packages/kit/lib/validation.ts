import { ErrorDetail } from '@punica/form';
import { FieldProps, Messages, Validation } from './types';

const messages: Messages = {
  required: (label) => `${label} is required`,
  minLength: (label, length) =>
    `${label} must be at least ${length} characters`,
  maxLength: (label, length) => `${label} must be at most ${length} characters`,
  pattern: (label) => `${label} is not valid`,
  min: (label, value) => `${label} must be at least ${value}`,
  max: (label, value) => `${label} must be at most ${value}`,
  minDate: (label, date) => `${label} must be ${date} or later`,
  maxDate: (label, date) => `${label} must be ${date} or earlier`,
  minItems: (label, count) => `${label} needs at least ${count}`,
  maxItems: (label, count) => `${label} takes at most ${count}`,
  maxFileSize: (label, bytes) =>
    `${label} must not be larger than ${Math.round(bytes / 1024)} KB`
};

/** Whether a value is a file, as far as its size goes. */
const isFile = (value: unknown): value is { size: number } => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { size?: unknown }).size === 'number'
  );
};

/**
 * Replaces messages of the built-in rules for every form, for example with
 * translations. A field can still have its own with `messages`.
 */
export const setMessages = (custom: Partial<Messages>): void => {
  Object.assign(messages, custom);
};

const isEmpty = (value: unknown): boolean => {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    value === false ||
    (Array.isArray(value) && value.length === 0)
  );
};

/** The first rule the value breaks, as its message. */
const check = (props: FieldProps, value: unknown): string | undefined => {
  const { label, minLength, maxLength, pattern, min, max } = props;
  const { minDate, maxDate, minItems, maxItems, maxFileSize } = props;
  const text = { ...messages, ...props.messages };

  if (isEmpty(value)) {
    if (props.required) return text.required(label);

    // A list that needs rows needs them, whether it is required or not
    return Array.isArray(value) && minItems
      ? text.minItems(label, minItems)
      : undefined;
  }

  if (typeof value === 'string') {
    if (minLength !== undefined && value.length < minLength) {
      return text.minLength(label, minLength);
    }

    if (maxLength !== undefined && value.length > maxLength) {
      return text.maxLength(label, maxLength);
    }

    if (pattern) {
      // A pattern with the g or y flag remembers where its last match ended
      pattern.lastIndex = 0;

      if (!pattern.test(value)) return text.pattern(label);
    }
  }

  if (typeof value === 'number') {
    if (min !== undefined && value < min) return text.min(label, min);
    if (max !== undefined && value > max) return text.max(label, max);
  }

  // Dates are `yyyy-mm-dd`, which sorts like the dates themselves
  if (typeof value === 'string') {
    if (minDate && value < minDate) return text.minDate(label, minDate);
    if (maxDate && value > maxDate) return text.maxDate(label, maxDate);
  }

  if (Array.isArray(value)) {
    if (minItems !== undefined && value.length < minItems) {
      return text.minItems(label, minItems);
    }

    if (maxItems !== undefined && value.length > maxItems) {
      return text.maxItems(label, maxItems);
    }
  }

  if (
    maxFileSize !== undefined &&
    (Array.isArray(value) ? value : [value]).some(
      (file) => isFile(file) && file.size > maxFileSize
    )
  ) {
    return text.maxFileSize(label, maxFileSize);
  }

  return undefined;
};

/**
 * The validation of a field: its rules first, then its own `validation`
 * function, which only runs for a value that passed the rules.
 */
export const createValidation = (props: FieldProps): Validation => {
  return async (command, context): Promise<ErrorDetail> => {
    // The rules are read from the item, so a starter or a control function can change them
    const item = { ...props, ...command.formItem } as FieldProps;
    const message = check(item, command.formItem.value);

    if (message) {
      return { error: true, errorMessages: [message] };
    }

    const result = await props.validation?.(command, context);

    // An error always has a message: a field must not block the form silently
    if (result?.error && !result.errorMessages?.length) {
      const text = { ...messages, ...item.messages };

      return { error: true, errorMessages: [text.pattern(item.label)] };
    }

    return result ?? { error: false, errorMessages: [] };
  };
};
