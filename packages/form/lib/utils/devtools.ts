import { Form, FormItem } from '../model';

/**
 * Interface for DevTools message
 */
interface DevToolsMessage {
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

    console.log('🔥 DevToolsBridge.sendMessage:', type, data, formItemKey);

    try {
      const message: DevToolsMessage = {
        type,
        data: JSON.stringify(data)
      };

      // Try multiple ways to send message to ensure it reaches content script
      try {
        window.postMessage(message, '*');
      } catch (e) {
        // Fallback: try with current window
        if (typeof window !== 'undefined') {
          window.postMessage(message, '*');
        }
      }
    } catch (error) {
      // Silently fail in production
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
    this.sendMessage('REGISTER_ITEMS', Array.from(itemKeys));
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
      {
        property,
        value,
        item
      },
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
