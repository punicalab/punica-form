import type { FormItem } from '@punica/form';
import type { ClearError } from './clearError';
import type { ClearErrors } from './clearErrors';
import type { FieldArray } from './fieldArray';
import type { GetValues } from './getValues';
import type { Reset } from './reset';
import type { ResetItem } from './resetItem';
import type { SetValue } from './setValue';
import type { Submit } from './submit';
import type { Touch } from './touch';
import type { Trigger } from './trigger';
import type { Validate } from './validate';

export * from './clearError';
export * from './clearErrors';
export * from './fieldArray';
export { addFormValidation } from './formValidation';
export { wrapValidation } from './rows';
export type { FormValidation } from './formValidation';
export type { FormRow } from './rows';
export * from './getValues';
export * from './reset';
export * from './resetItem';
export * from './setValue';
export * from './store';
export * from './submit';
export * from './touch';
export * from './trigger';
export * from './validate';

// Binds the services to the entity of the form they are read from:
// controller.getService(Trigger).run(property) only accepts its properties
declare module '@punica/form' {
  interface ServiceRegistry<E, F extends FormItem<E>> {
    clearError: ClearError<E, F>;
    clearErrors: ClearErrors<E, F>;
    fieldArray: FieldArray<E, F>;
    getValues: GetValues<E, F>;
    reset: Reset<E, F>;
    resetItem: ResetItem<E, F>;
    setValue: SetValue<E, F>;
    submit: Submit<E, F>;
    touch: Touch<E, F>;
    trigger: Trigger<E, F>;
    validate: Validate<E, F>;
  }
}
