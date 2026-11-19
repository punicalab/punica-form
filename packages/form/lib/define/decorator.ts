/**
 * Decorators that work with both decorator implementations of TypeScript:
 * the legacy one (`experimentalDecorators`) and the standard one.
 */

/** A class decorator. Both implementations pass the class first. */
export type FormClassDecorator = (
  target: object,
  context?: ClassDecoratorContext
) => void;

/**
 * A property decorator: `(prototype, propertyKey)` for the legacy
 * implementation, `(undefined, context)` for the standard one.
 */
export type FormPropertyDecorator = (
  target: object | undefined,
  context: string | symbol | ClassFieldDecoratorContext
) => void;

/**
 * Creates a property decorator.
 * @param register - Called with the class and the name of the decorated property
 */
export const propertyDecorator = (
  register: (target: object, property: string) => void
): FormPropertyDecorator => {
  return (target, context) => {
    if (typeof context === 'object') {
      // Standard decorators see the class only once an instance exists
      context.addInitializer(function (this: unknown) {
        register((this as object).constructor, String(context.name));
      });
    } else {
      register((target as object).constructor, String(context));
    }
  };
};
