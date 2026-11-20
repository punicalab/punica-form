import { deepCopy } from '../utils/deepCopy';
import { FormClassDecorator, FormPropertyDecorator } from './decorator';

/** A property of a form defined with `defineForm`. */
export type FormField<T> = {
  /** The value a new form starts with. */
  value: T;

  decorators: FormPropertyDecorator[];
};

/** The entity of a form defined with `defineForm`. */
export type FormValues<S extends Record<string, FormField<unknown>>> = {
  -readonly [K in keyof S]: S[K]['value'];
};

/**
 * A property of a form defined with `defineForm`: the value it starts with
 * and the decorators a form class would have on the property.
 *
 * field('', Text({ label: 'Name' }))
 * field<number | undefined>(undefined, NumberField({ label: 'Age' }))
 */
export const field = <T>(
  value: T,
  ...decorators: FormPropertyDecorator[]
): FormField<T> => ({ value, decorators });

/**
 * Defines a form class without decorator syntax, for projects whose build
 * does not compile decorators. The class is what a decorated class would
 * be: give its instances to `FormController.fromEntity`.
 *
 * const UserForm = defineForm(
 *   { name: field('', Text({ label: 'Name' })) },
 *   Services([GetValues, SetValue])
 * );
 * type User = InstanceType<typeof UserForm>;
 *
 * const controller = await FormController.fromEntity(new UserForm());
 * Decorators are applied like the ones written above a class or a property:
 * the last one first. The value of a field is read once, when the form is
 * defined, and copied for every instance; give values that differ between
 * instances, such as the current date, to the constructor.
 * @param fields - The properties of the form, in the order of its items
 * @param decorators - What a form class would have above it: `Services`, `Readers`, …
 * @returns A class whose constructor takes values that replace the initial
 * ones; a value that is `undefined` leaves the initial one in place
 */
export const defineForm = <S extends Record<string, FormField<unknown>>>(
  fields: S,
  ...decorators: FormClassDecorator[]
): new (values?: Partial<FormValues<S>>) => FormValues<S> => {
  class DefinedForm {
    constructor(values: Partial<FormValues<S>> = {}) {
      for (const [property, { value }] of Object.entries(fields)) {
        // Every form gets its own copy of a value that is an object
        (this as Record<string, unknown>)[property] =
          Object.prototype.hasOwnProperty.call(values, property) &&
          values[property] !== undefined
            ? values[property]
            : deepCopy(value);
      }
    }
  }

  for (const [property, { decorators }] of Object.entries(fields)) {
    for (const decorate of [...decorators].reverse()) {
      decorate(DefinedForm.prototype, property);
    }
  }

  for (const decorate of [...decorators].reverse()) {
    decorate(DefinedForm);
  }

  return DefinedForm as new (values?: Partial<FormValues<S>>) => FormValues<S>;
};
