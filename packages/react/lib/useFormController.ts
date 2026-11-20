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
  const started = useRef<Promise<FormController<E, F>>>(undefined);

  useEffect(() => {
    // An unmounted component is ignored
    let active = true;

    // The effect runs again in StrictMode and when a hidden <Activity> is
    // shown again: the form that was started first is kept
    started.current ??= Promise.resolve().then(async () => {
      const { createEntity, options } = create.current;
      const controller = await FormController.fromEntity<E, F>(
        createEntity(),
        options
      );

      await controller.start();

      return controller;
    });

    started.current.then(
      (controller) => {
        if (active) setState({ controller });
      },
      (error: unknown) => {
        if (active) {
          setState({ error: error ?? new Error('The form did not start.') });
        }
      }
    );

    return () => {
      active = false;
    };
  }, []);

  return state;
};
