import { useEffect, useRef, useState } from 'react';
import { FormController, FormItem } from '@punica/form';

export type FormControllerState<E extends object, F extends FormItem<E>> = {
  /** The started controller; `undefined` while the form is being started. */
  controller?: FormController<E, F>;

  /** What was thrown while the form was created or started. */
  error?: unknown;
};

/**
 * Creates a controller when the component mounts and starts it. Use it for
 * forms that are not made from an entity, such as a form described as data;
 * for a form class there is `useFormController`.
 * @param create - Returns the controller, not started; read when the
 * component mounts. Give the component a `key` to create another form
 */
export const useController = <
  E extends object,
  F extends FormItem<E> = FormItem<E>
>(
  create: () => FormController<E, F> | Promise<FormController<E, F>>
): FormControllerState<E, F> => {
  const [state, setState] = useState<FormControllerState<E, F>>({});
  const first = useRef(create);
  const started = useRef<Promise<FormController<E, F>>>(undefined);

  useEffect(() => {
    // An unmounted component is ignored
    let active = true;

    // The effect runs again in StrictMode and when a hidden <Activity> is
    // shown again: the form that was started first is kept
    started.current ??= Promise.resolve().then(async () => {
      const controller = await first.current();

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
