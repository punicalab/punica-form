import type { FormItemRegister } from './register';

/**
 * The state every copy of this package shares. A project can load the ESM
 * and the CommonJS build side by side (an app and its test runner, for
 * example); decorators applied through one copy must be visible to the other.
 */
type Shared = {
  /** Class → key → data of the class decorators. */
  formProperties: WeakMap<object, Map<string, unknown>>;

  /** Class → key → property → data of the property decorators. */
  formItemProperties: WeakMap<object, Map<string, Record<string, unknown>>>;

  /** The default form item register, created on first use. */
  register?: FormItemRegister;

  /** Whether forms report to the DevTools extension. */
  devTools: boolean;

  /** Service instances that were given to a controller. */
  usedServices: WeakSet<object>;
};

const KEY = Symbol.for('@punica/form');
const scope = globalThis as { [KEY]?: Shared };

export const shared: Shared = (scope[KEY] ??= {
  formProperties: new WeakMap(),
  formItemProperties: new WeakMap(),
  devTools: false,
  usedServices: new WeakSet()
});
