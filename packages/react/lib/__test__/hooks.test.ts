import { StrictMode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { FormController, Services, defineFormItem } from '@punica/form';
import { SetValue } from '@punica/form-service';
import { useForm, useFormController } from '..';

const Text = defineFormItem<{ label: string }>('react:text', () => null);

@Services([SetValue])
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
    // StrictMode mounts twice; the first form is discarded
    expect(create.mock.calls.length).toBeLessThanOrEqual(2);
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
