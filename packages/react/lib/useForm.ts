import { useSyncExternalStore } from 'react';
import { Form, FormController, FormItem } from '@punica/form';

/**
 * The current form of a controller. The component renders again after
 * every change of the form.
 */
export const useForm = <E extends object, F extends FormItem<E>>(
  controller: FormController<E, F>
): Form<E, F> => {
  return useSyncExternalStore(
    controller.subscribe,
    controller.getForm,
    controller.getForm
  );
};
