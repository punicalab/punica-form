import {
  Form,
  FormClassDecorator,
  FormPropertyDecorator,
  IReader,
  IService,
  IStarter,
  Readers,
  Services,
  Starters,
  defineFormItem,
  defineFormProperty,
  getFormProperty
} from '@punica/form';
import {
  GetValues,
  Reset,
  SetValue,
  Trigger,
  Validate
} from '@punica/form-service';
import { FieldProps, KitItem } from './types';
import { createValidation } from './validation';

const OPTIONS = 'kit:options';

export type FormKitOptions = {
  /** The heading of the form. */
  title?: string;

  /** Text under the heading. */
  description?: string;

  /** Columns the fields are laid out in, 1 by default. */
  columns?: 1 | 2 | 3 | 4;

  /** Services in addition to GetValues, SetValue, Validate, Trigger and Reset. */
  services?: Array<IService | (new () => IService)>;

  /** Readers in addition to the kit's. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readers?: Array<IReader<any, any>>;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  starters?: Array<IStarter<any, any>>;
};

/** Writes the options of `@FormKit` onto the form. */
class KitReader<E extends object, F extends KitItem<E>> implements IReader<
  E,
  F
> {
  public read(entity: E, form: Form<E, F>): void {
    const { title, description, columns } =
      getFormProperty<FormKitOptions>(entity, OPTIONS) ?? {};

    Object.assign(form, { title, description, columns: columns ?? 1 });
  }
}

/**
 * Turns a class into a form of the kit: the built-in services, the kit's
 * reader and the options of the form. It replaces `@Services`, `@Readers`
 * and `@Starters`; pass yours in the options.
 */
export const FormKit = (options: FormKitOptions = {}): FormClassDecorator => {
  return (target) => {
    defineFormProperty<FormKitOptions>(OPTIONS)(options)(target);
    Services([
      GetValues,
      SetValue,
      Validate,
      Trigger,
      Reset,
      ...(options.services ?? [])
    ])(target);
    Readers([new KitReader(), ...(options.readers ?? [])])(target);
    Starters(options.starters ?? [])(target);
  };
};

/** The form item types of the kit. */
export const KIT_TYPES = {
  text: 'kit:text',
  textarea: 'kit:textarea',
  number: 'kit:number',
  select: 'kit:select',
  checkbox: 'kit:checkbox',
  switch: 'kit:switch'
} as const;

/**
 * A field decorator of a type. The components that render the types live in
 * `@punica/form-kit/react`; the register only records that the type exists.
 */
const field = (type: string) => {
  const define = defineFormItem<FieldProps>(type, () => null);

  return (props: FieldProps): FormPropertyDecorator => {
    return define({ ...props, validation: createValidation(props) });
  };
};

/** A single-line text field. */
export const TextField = field(KIT_TYPES.text);

/** A multi-line text field. */
export const TextAreaField = field(KIT_TYPES.textarea);

/** A number field; its value is a number, or `undefined` while it is empty. */
export const NumberField = field(KIT_TYPES.number);

/** A select with `options`. */
export const SelectField = field(KIT_TYPES.select);

/** A checkbox; its value is a boolean. `required` means it has to be ticked. */
export const CheckboxField = field(KIT_TYPES.checkbox);

/** A switch; its value is a boolean. */
export const SwitchField = field(KIT_TYPES.switch);
