import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { FormController, Services, defineFormItem } from '@punica/form';
import { SetValue, Touch } from '@punica/form-service';
import { useController, useForm, useFormController, useFormState } from '..';

const Text = defineFormItem<{ label: string }>('react:text', () => null);

@Services([SetValue, Touch])
class UserForm {
  @Text({ label: 'Name' })
  public name = 'Jane';
}

/** Fails while it is started. */
@Services([
  class Failing {
    public get name() {
      return 'failing';
    }

    public initialize() {
      throw new Error('cannot start');
    }
  }
])
class BrokenForm {
  @Text({ label: 'Name' })
  public name = '';
}

describe('useFormController', () => {
  test('returns the started controller', async () => {
    const { result } = renderHook(() =>
      useFormController(() => new UserForm())
    );

    expect(result.current.controller).toBeUndefined();

    await waitFor(() => expect(result.current.controller).toBeDefined());

    expect(result.current.controller?.getForm().items[0].value).toEqual('Jane');
    expect(result.current.error).toBeUndefined();
  });

  test('keeps one controller for the life of the component, also in StrictMode', async () => {
    const create = jest.fn(() => new UserForm());
    const { result, rerender } = renderHook(() => useFormController(create), {
      wrapper: StrictMode
    });

    await waitFor(() => expect(result.current.controller).toBeDefined());

    const { controller } = result.current;

    rerender();

    expect(result.current.controller).toBe(controller);
    // StrictMode runs the effect twice; the form is created once
    expect(create).toHaveBeenCalledTimes(1);
  });

  test('reports an entity that cannot be created, and a failure without a reason', async () => {
    const thrown = renderHook(() =>
      useFormController<UserForm>(() => {
        throw new Error('cannot create');
      })
    );

    await waitFor(() =>
      expect(thrown.result.current.error).toEqual(new Error('cannot create'))
    );

    const silent = renderHook(() =>
      useFormController<UserForm>(() => {
        throw undefined;
      })
    );

    await waitFor(() => expect(silent.result.current.error).toBeDefined());
  });

  test('reports what failed while the form was started', async () => {
    const { result } = renderHook(() =>
      useFormController(() => new BrokenForm())
    );

    await waitFor(() => expect(result.current.error).toBeDefined());

    expect(result.current.error).toEqual(new Error('cannot start'));
    expect(result.current.controller).toBeUndefined();
  });

  test('ignores a form that finishes starting after the component unmounted', async () => {
    const setState = jest.spyOn(console, 'error').mockImplementation();
    const { unmount } = renderHook(() =>
      useFormController(() => new UserForm())
    );

    unmount();
    await act(() => new Promise((resolve) => setTimeout(resolve)));

    expect(setState).not.toHaveBeenCalled();
    setState.mockRestore();
  });
});

describe('useForm', () => {
  test('follows the form and stops when the component unmounts', async () => {
    const controller = await FormController.fromEntity(new UserForm());

    await controller.start();

    const renders = jest.fn();
    const { result, unmount } = renderHook(() => {
      renders();

      return useForm(controller);
    });

    expect(result.current).toBe(controller.getForm());

    await act(() => controller.getService(SetValue).run('name', 'John'));

    expect(result.current.items[0].value).toEqual('John');
    expect(result.current).toBe(controller.getForm());

    const count = renders.mock.calls.length;

    unmount();
    await controller.getService(SetValue).run('name', 'Jack');

    expect(renders).toHaveBeenCalledTimes(count);
  });
});

describe('useFormState', () => {
  test('renders again when the state changes, not after every change of an item', async () => {
    const controller = await FormController.fromEntity(new UserForm());
    const renders = jest.fn();
    const { result } = renderHook(() => {
      renders();

      return useFormState(controller);
    });

    expect(result.current).toMatchObject({ dirty: false, valid: true });

    await act(() => controller.start());
    await act(() => controller.getService(SetValue).run('name', 'J'));

    expect(result.current.dirty).toBe(true);

    const count = renders.mock.calls.length;

    await act(() => controller.getService(SetValue).run('name', 'Jo'));

    expect(renders).toHaveBeenCalledTimes(count);

    await act(() => controller.getService(Touch).run('name'));

    expect(result.current.touched).toBe(true);
  });
});

describe('useController', () => {
  test('starts the controller it is given, also one of a form described as data', async () => {
    const { result } = renderHook(() =>
      useController(() =>
        FormController.fromForm<{ name: string }>({
          items: [{ property: 'name', label: 'Name', value: 'Jane' }]
        })
      )
    );

    await waitFor(() => expect(result.current.controller).toBeDefined());

    expect(result.current.controller?.getForm().state?.valid).toBe(true);
  });
});
