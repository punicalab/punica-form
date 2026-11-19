import { useEffect, useRef, useState } from 'react';
import { FormController, FormControllerOptions, FormItem } from '@punica/form';

export type FormControllerState<E extends object, F extends FormItem<E>> = {
  /** The started controller; `undefined` while the form is being started. */
  controller?: FormController<E, F>;

  /** What a reader, a starter or a service threw while the form was started. */
  error?: unknown;
};

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
  const [state, setState] = useState<FormControllerState<E, F>>({});
  const create = useRef({ createEntity, options });

  useEffect(() => {
    // An unmounted component, or the first run in StrictMode, is ignored
    let active = true;
    const { createEntity, options } = create.current;

    FormController.fromEntity<E, F>(createEntity(), options)
      .then(async (controller) => {
        await controller.start();

        if (active) setState({ controller });
      })
      .catch((error: unknown) => {
        if (active) setState({ error });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
};
