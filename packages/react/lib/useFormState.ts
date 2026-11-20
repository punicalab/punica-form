import { useSyncExternalStore } from 'react';
import { FormController, FormItem, FormState } from '@punica/form';

/** The state of a form that is not started yet. */
const NOT_STARTED: FormState = {
  dirty: false,
  touched: false,
  valid: true,
  validating: false,
  submitting: false,
  submitCount: 0,
  errors: []
};

/**
 * The state of a form as a whole: dirty, touched, valid, validating, submitting, its
 * submit count and its errors. Unlike `useForm`, the component only renders
 * again when this state changes, not after every change of an item.
 */
export const useFormState = <E extends object, F extends FormItem<E>>(
  controller: FormController<E, F>
): FormState => {
  const getState = () => controller.getForm().state ?? NOT_STARTED;

  return useSyncExternalStore(controller.subscribe, getState, getState);
};
