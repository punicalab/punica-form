import {
  disableDevTools,
  enableDevTools,
  FormItem,
  getDevToolsBridge
} from '..';

describe('devtools bridge', () => {
  let postMessage: jest.SpyInstance;

  beforeEach(() => {
    postMessage = jest.spyOn(window, 'postMessage').mockImplementation();
  });

  afterEach(() => {
    disableDevTools();
    postMessage.mockRestore();
  });

  test('sends nothing while disabled', () => {
    getDevToolsBridge().sendEntity({ name: 'a' });

    expect(postMessage).not.toHaveBeenCalled();
  });

  test('sends marked messages only to the page origin', () => {
    const item: FormItem<any> = {
      property: 'name',
      label: 'Name'
    };

    enableDevTools();
    getDevToolsBridge().sendUpdateItem(item);

    expect(postMessage).toHaveBeenCalledWith(
      {
        source: 'punica-form-devtools',
        type: 'UPDATE_ITEM',
        data: JSON.stringify(item),
        formItemKey: 'name'
      },
      window.location.origin
    );
  });

  test('does not throw on non-serializable data', () => {
    const circular: Record<string, any> = {};
    circular.self = circular;

    enableDevTools();

    expect(() => getDevToolsBridge().sendEntity(circular)).not.toThrow();
    expect(postMessage).not.toHaveBeenCalled();
  });
});
