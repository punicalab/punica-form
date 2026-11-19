/** Marker the DevTools extension recognizes bridge messages by. */
export const DEVTOOLS_MESSAGE_SOURCE = 'punica-form-devtools';

/** Version of the message format. */
export const DEVTOOLS_PROTOCOL_VERSION = 2;

let enabled = false;

/**
 * Makes the forms of the page report to the Punica Form DevTools extension.
 * Call it once, in development only.
 */
export const enableDevTools = (): void => {
  enabled = true;
};

export const disableDevTools = (): void => {
  enabled = false;
};

export const isDevToolsEnabled = (): boolean => {
  return enabled && typeof window !== 'undefined';
};

/**
 * Sends a message to the DevTools extension, to the page's own origin only.
 * @param formId - Identifies the form among the forms of the page
 * @param type - `@@INIT`, `ENTITY` or the name of a form event
 * @param formItemKey - The property the message is about
 */
export const sendToDevTools = (
  formId: string,
  type: string,
  data: unknown,
  formItemKey?: string
): void => {
  if (!isDevToolsEnabled()) {
    return;
  }

  try {
    window.postMessage(
      {
        source: DEVTOOLS_MESSAGE_SOURCE,
        version: DEVTOOLS_PROTOCOL_VERSION,
        formId,
        type,
        data: JSON.stringify(data),
        formItemKey
      },
      window.location.origin
    );
  } catch {
    // Debugging must never break the form (e.g. non-serializable data)
  }
};
