import { FormController, FormControllerOptions, FormItem } from '@punica/form';
import { FormControllerState, useController } from './useController';

/**
 * Creates the controller of a form when the component mounts and starts it.
 * @param createEntity - Returns the entity of the form, for example `() => new UserForm()`
 * @param options - Options of the controller, read when the component mounts
 */
export const useFormController = <
  E extends object,
  F extends FormItem<E> = FormItem<E>
>(
  createEntity: () => E,
  options?: FormControllerOptions
): FormControllerState<E, F> => {
  return useController(() =>
    FormController.fromEntity<E, F>(createEntity(), options)
  );
};
