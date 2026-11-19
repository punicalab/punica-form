import { FormController, disableDevTools, enableDevTools } from '..';

describe('devtools bridge', () => {
  let postMessage: jest.SpyInstance;

  const startForm = async (value: unknown = 'a') => {
    const controller = await FormController.fromForm<{ name: unknown }>(
      { items: [{ property: 'name', label: 'Name', value }] },
      { name: 'Demo' }
    );

    await controller.start();
  };

  beforeEach(() => {
    postMessage = jest.spyOn(window, 'postMessage').mockImplementation();
  });

  afterEach(() => {
    disableDevTools();
    postMessage.mockRestore();
  });

  test('sends nothing while disabled', async () => {
    await startForm();

    expect(postMessage).not.toHaveBeenCalled();
  });

  test('sends marked, versioned messages only to the page origin', async () => {
    enableDevTools();
    await startForm();

    const [message, origin] = postMessage.mock.calls.find(
      ([sent]) => sent.type === '@@INIT'
    );

    expect(origin).toEqual(window.location.origin);
    expect(message).toMatchObject({
      source: 'punica-form-devtools',
      version: 2
    });
    expect(message.formId).toMatch(/^Demo#\d+$/);
    expect(JSON.parse(message.data).items[0].value).toEqual('a');
  });

  test('does not throw on non-serializable data', async () => {
    const circular: Record<string, unknown> = {};
    circular.self = circular;

    enableDevTools();

    await expect(startForm(circular)).resolves.toBeUndefined();
  });
});
