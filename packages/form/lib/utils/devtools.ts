import { Form, FormItem } from '../model';

/**
 * Marker used by the DevTools extension to recognize bridge messages
 */
export const DEVTOOLS_MESSAGE_SOURCE = 'punica-form-devtools';

/**
 * Interface for DevTools message
 */
interface DevToolsMessage {
  source: typeof DEVTOOLS_MESSAGE_SOURCE;
  type: string;
  data: string;
  formItemKey?: string;
}

/**
 * DevTools bridge for sending form events to Chrome DevTools extension
 */
class DevToolsBridge {
  private static instance: DevToolsBridge | null = null;
  private enabled: boolean = false;

  /**
   * Get singleton instance
   */
  public static getInstance(): DevToolsBridge {
    if (!DevToolsBridge.instance) {
      DevToolsBridge.instance = new DevToolsBridge();
    }

    return DevToolsBridge.instance;
  }

  /**
   * Enable DevTools bridge
   */
  public enable(): void {
    this.enabled = true;
  }

  /**
   * Disable DevTools bridge
   */
  public disable(): void {
    this.enabled = false;
  }

  /**
   * Check if DevTools bridge is enabled
   */
  public isEnabled(): boolean {
    return this.enabled && typeof window !== 'undefined';
  }

  /**
   * Send message to DevTools extension
   */
  private sendMessage(type: string, data: any, formItemKey?: string): void {
    if (!this.isEnabled()) {
      return;
    }

    try {
      const message: DevToolsMessage = {
        source: DEVTOOLS_MESSAGE_SOURCE,
        type,
        data: JSON.stringify(data),
        formItemKey
      };

      window.postMessage(message, window.location.origin);
    } catch {
      // Debugging must never break the form (e.g. non-serializable data)
    }
  }

  /**
   * Send initialization event
   */
  public sendInit<E, F extends FormItem<E>>(form: Form<E, F>): void {
    this.sendMessage('@@INIT', form);
  }

  /**
   * Send entity data
   */
  public sendEntity<E>(entity: E): void {
    this.sendMessage('ENTITY', entity);
  }

  /**
   * Send form update event
   */
  public sendUpdate<E, F extends FormItem<E>>(form: Form<E, F>): void {
    this.sendMessage('UPDATE_FORM', form);
  }

  /**
   * Send form reset event
   */
  public sendReset<E, F extends FormItem<E>>(form: Form<E, F>): void {
    this.sendMessage('RESET', form);
  }

  /**
   * Send item update event
   */
  public sendUpdateItem<E, F extends FormItem<E>>(item: F | F[]): void {
    const items = Array.isArray(item) ? item : [item];

    items.forEach((formItem) => {
      this.sendMessage('UPDATE_ITEM', formItem, formItem.property as string);
    });
  }

  /**
   * Send register items event
   */
  public sendRegisterItems(itemKeys: string[]): void {
    this.sendMessage('REGISTER_ITEMS', itemKeys);
  }

  /**
   * Send property value update event
   */
  public sendUpdatePropertyValue<E, F extends FormItem<E>>(
    property: keyof E,
    value: any,
    item: F
  ): void {
    this.sendMessage(
      'UPDATE_PROPERTY_VALUE',
      { property, value, item },
      property as string
    );
  }
}

/**
 * Get DevTools bridge instance
 */
export const getDevToolsBridge = (): DevToolsBridge => {
  return DevToolsBridge.getInstance();
};

/**
 * Enable DevTools bridge
 */
export const enableDevTools = (): void => {
  getDevToolsBridge().enable();
};

/**
 * Disable DevTools bridge
 */
export const disableDevTools = (): void => {
  getDevToolsBridge().disable();
};

/**
 * Check if DevTools bridge is enabled
 */
export const isDevToolsEnabled = (): boolean => {
  return getDevToolsBridge().isEnabled();
};
