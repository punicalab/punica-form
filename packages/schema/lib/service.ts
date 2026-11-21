import {
  CommandService,
  FormItem,
  IServiceInitialize,
  isEqual
} from '@punica/form';
import { addFormValidation } from '@punica/form-service';
import { schemaOf } from './decorator';
import { Sorted, sort, validate, valuesOf } from './issues';
import { StandardSchema } from './standard';

/**
 * Validates a form with the schema `@Schema` gave its class. Every issue of
 * the schema is shown on the item it is about; issues that belong to no
 * item, such as a rule about two values, become errors of the form
 * (`state.errors`) when it is validated as a whole or submitted.
 *
 * A validation function of an item still runs, before the schema: the
 * schema is asked about an item that passed it. Hidden and disabled items
 * are not validated, as always.
 *
 * For a form that is not made from a class, give the schema to the service:
 * `services: [SchemaValidation.of(schema), …]`.
 */
export class SchemaValidation<
  E,
  F extends FormItem<E> = FormItem<E>
> implements IServiceInitialize<E, F> {
  /** The schema of the forms of a service made with `of`. */
  protected static schema?: StandardSchema;

  #command!: CommandService<E, F>;
  #schema?: StandardSchema;
  #running?: { values: unknown; issues: Promise<Sorted<E>> };

  /**
   * A service for the forms of one schema, for forms without a class that
   * `@Schema` could be written above.
   */
  public static of(standard: StandardSchema): typeof SchemaValidation {
    return class extends SchemaValidation<never> {
      protected static schema = standard;
    } as unknown as typeof SchemaValidation;
  }

  public get name(): string {
    return 'schemaValidation';
  }

  public initialize(command: CommandService<E, F>): void {
    this.#command = command;
    this.#schema =
      (this.constructor as typeof SchemaValidation).schema ??
      schemaOf(command.initialEntity);

    // The rows of a list get the services of their form; their class may
    // have no schema
    if (!this.#schema) return;

    command.setItems(
      command.getForm().items.map((item) => ({
        ...item,
        validation: async (commandItem, context) => {
          const own = await item.validation?.call(item, commandItem, context);

          if (own?.error) return own;

          const messages =
            (await this.#issues()).items.get(item.property) ?? [];

          return { error: messages.length > 0, errorMessages: messages };
        }
      }))
    );

    addFormValidation(command, async () => (await this.#issues()).form);
  }

  /**
   * The issues of the values the form holds now. The items of a form that
   * is validated as a whole ask one after the other: they share one run,
   * for as long as the values stay the same.
   */
  #issues(): Promise<Sorted<E>> {
    const { items } = this.#command.getForm();
    const values = valuesOf(items);

    if (this.#running && isEqual(values, this.#running.values)) {
      return this.#running.issues;
    }

    const running = {
      values,
      issues: validate(this.#schema as StandardSchema, values).then((issues) =>
        sort(issues, items)
      )
    };

    this.#running = running;

    // A schema may ask a server: the answer is not kept beyond this turn.
    // A run that failed is not kept at all
    running.issues
      .then(() => new Promise((resolve) => setTimeout(resolve)))
      .catch(() => undefined)
      .finally(() => {
        if (this.#running === running) this.#running = undefined;
      });

    return running.issues;
  }
}
