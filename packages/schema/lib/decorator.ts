import { defineFormProperty, getFormProperty } from '@punica/form';
import { InputOf, StandardSchema } from './standard';

const SCHEMA = '@punica/form-schema';

/**
 * What a form class may hold for a schema: the properties of the schema it
 * has are of the type the schema takes. A form may leave properties out and
 * start with empty values, which is what the schema is there to report.
 */
type Fits<T> = T extends object ? { [K in keyof T]?: T[K] | null } : unknown;

/**
 * Validates a form with a schema of its values:
 *
 * @Schema(z.object({ email: z.string().email(), age: z.number().min(18) }))
 * @Services([SchemaValidation, Validate, Submit, …])
 * class UserForm { … }
 *
 * The form has to list the `SchemaValidation` service, which shows every
 * issue of the schema on the item it is about. A class whose properties do
 * not have the types the schema takes does not compile.
 * @param standard - A schema of Zod, Valibot, ArkType or another library
 * that implements Standard Schema
 */
export const Schema = <S extends StandardSchema>(standard: S) => {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    target: abstract new (...args: any[]) => Fits<InputOf<S>>,
    context?: ClassDecoratorContext
  ): void => {
    defineFormProperty<StandardSchema>(SCHEMA)(standard)(target, context);
  };
};

/** The schema `@Schema` gave the class of an entity. */
export const schemaOf = (entity: unknown): StandardSchema | undefined => {
  return entity && typeof entity === 'object'
    ? getFormProperty<StandardSchema>(entity, SCHEMA)
    : undefined;
};
