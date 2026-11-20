import { ErrorDetail } from '@punica/form';
import { FieldProps, Messages, Validation } from './types';

const messages: Messages = {
  required: (label) => `${label} is required`,
  minLength: (label, length) =>
    `${label} must be at least ${length} characters`,
  maxLength: (label, length) => `${label} must be at most ${length} characters`,
  pattern: (label) => `${label} is not valid`,
  min: (label, value) => `${label} must be at least ${value}`,
  max: (label, value) => `${label} must be at most ${value}`
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
  const text = { ...messages, ...props.messages };

  if (isEmpty(value)) {
    return props.required ? text.required(label) : undefined;
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

  return undefined;
};

/**
 * The validation of a field: its rules first, then its own `validation`
 * function, which only runs for a value that passed the rules.
 */
export const createValidation = (props: FieldProps): Validation => {
  return async (command): Promise<ErrorDetail> => {
    // The rules are read from the item, so a starter or a control function can change them
    const item = { ...props, ...command.formItem } as FieldProps;
    const message = check(item, command.formItem.value);

    if (message) {
      return { error: true, errorMessages: [message] };
    }

    const result = await props.validation?.(command);

    // An error always has a message: a field must not block the form silently
    if (result?.error && !result.errorMessages?.length) {
      const text = { ...messages, ...item.messages };

      return { error: true, errorMessages: [text.pattern(item.label)] };
    }

    return result ?? { error: false, errorMessages: [] };
  };
};
