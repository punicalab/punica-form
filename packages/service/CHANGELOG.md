# @punica/form-service

## 2.1.0-next.0

### Minor Changes

- [#62](https://github.com/punicalab/punica-form/pull/62) [`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122) Thanks [@punicalab](https://github.com/punicalab)! - Fixes from a review of 2.0, and a more robust core. No breaking changes.
  
  **Fixes**
  
  - `start()` now publishes the started form: subscribers and `UPDATE_FORM` listeners are notified, and the form `getForm()` returned before `start()` is no longer changed by readers.
  - `Validate` no longer overwrites a value that was set after its item had been validated.
  - A slow `control` function no longer reverts a newer value: when the property is set again or the form is reset meanwhile, the result of the older run is dropped.
  - `GetValues` no longer runs after every change when developer tools are disabled.
  - A decorated property without an initial value gets its form item with the legacy decorators and a target below ES2022 too.
  - `getService` finds a service registered as a subclass, and says so when it is called before `start()`.
  - The functions of form items accept parameters typed with your own item type and with service features (`CommandItem<E, AppItem<E>, StoreCommand>`) without a cast.
  
  **New**
  
  - `@Services` accepts service classes: `@Services([GetValues, SetValue])`. Every form then gets its own services. Instances still work, but are shared by the forms of a class; a warning is logged when that happens.
  - `controller.batch(fn)` notifies once for several changes.
  - `TypedFormItem<E>` types the `value` of an item by its property.
  - The ESM and the CommonJS build share their state, so decorators applied through one are visible to the other.
  - `readPropertyPath` and `writeToPropertyPath` are exported; the packages have no dependencies any more.

### Patch Changes

- Updated dependencies [[`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122)]:
  - @punica/form@2.1.0-next.0

## 2.0.0

### Major Changes

- [#59](https://github.com/punicalab/punica-form/pull/59) [`54f34bc`](https://github.com/punicalab/punica-form/commit/54f34bc4ba3ac90bc9d72b5fa084b5b8f8563b84) Thanks [@punicalab](https://github.com/punicalab)! - Punica Form 2: an immutable, typed core.
  
  **State**
  
  - The form is immutable. Every change produces a new form object; read it with `controller.getForm()` and follow it with `controller.subscribe(listener)` (works with `useSyncExternalStore`).
  - `UPDATE_FORM` is fired by the controller after every change. `RESET` is fired after it.
  - The functions of form items (`validation`, `control`, `initialize`) receive copies and return items instead of changing them.
  
  **Typed API**
  
  - Services are read by class and are bound to the entity of the form: `controller.getService(Trigger).run('name')` only accepts properties of the entity, `getService(GetValues).run()` returns the entity type. `getService` throws when the form has no such service.
  - `controller.on(event, handler)` has typed payloads and returns the function that removes the handler.
  - `strictNullChecks` is on. `FormItem`, `ErrorDetail` and `CommandItem` no longer accept arbitrary properties: describe the properties of your form system with your own item type (`FormItem<E> & { layout?: Layout }`).
  
  **Decorators**
  
  - Decorators work with the legacy implementation of TypeScript and with the standard one.
  - `reflect-metadata` and `@punica/common` are no longer dependencies. Readers read metadata with `getFormProperty(entity, key)` and `getFormItemProperties(entity, key)`.
  
  **Packaging**
  
  - ESM and CommonJS builds with an `exports` map; `sideEffects: false`.
  
  **Removed**
  
  | 1.x | 2.0 |
  | --- | --- |
  | `controller.getServices('validate')` | `controller.getService(Validate)` |
  | `item.setValue(property, value)` | `controller.getService(SetValue).run(property, value)` |
  | `controller.off(event, handler)` | the function `controller.on(event, handler)` returns |
  | `FormItemRegister.getInstance()` | `defaultFormItemRegister`, or `createFormItemRegister()` |
  | `register.unRegister(type)` | `register.unregister(type)` |
  | `Reflect.getMetadata(key, entity)` | `getFormProperty(entity, key)` / `getFormItemProperties(entity, key)` |
  | `IReader.read(entity, form, itemsMap)` | `IReader.read(entity, form)` |
  | `CommandService.form`, `.initialForm`, `.itemsMap`, `.writeItems`, `.fireEvent` | `getForm()`, `getInitialItems()`, `getItem()`, `setItems()`, `emit()` |
  | `getDevToolsBridge()`, `IServiceStartup`, `GetItem`, `WriteItems` | removed |
  
  The DevTools extension must be updated to 1.1.0, which understands the new message format.

### Patch Changes

- Updated dependencies [[`54f34bc`](https://github.com/punicalab/punica-form/commit/54f34bc4ba3ac90bc9d72b5fa084b5b8f8563b84)]:
  - @punica/form@2.0.0

## 1.2.0

### Minor Changes

- [#52](https://github.com/punicalab/punica-form/pull/52) [`d48b9c8`](https://github.com/punicalab/punica-form/commit/d48b9c84e2d6a220266c340a28db170e92ec9a3a) Thanks [@punicalab](https://github.com/punicalab)! - Fix `Reset` and `ResetItem`, harden the DevTools bridge and stop swallowing service errors.
  
  - `Reset` and `ResetItem` restore the initial items; `Reset` now also fires the `RESET` event.
  - Services are initialized after readers and starters and always see the current form.
  - `deepCopy` keeps functions and prototypes and supports circular references. `deepCopyFunction` and `deepCopySpecialTypes` are removed.
  - Service errors reject instead of being logged; unknown properties fail with `Item not found`.
  - `GetValues` no longer mutates the initial entity.
  - `REGISTER_ITEMS` is fired with a `string[]`.
  - DevTools messages are marked, carry `formItemKey` and are posted to the page origin only. Requires the matching DevTools extension.
  - `@punica/form` is a peer dependency of `@punica/form-service`.

### Patch Changes

- Updated dependencies [[`d48b9c8`](https://github.com/punicalab/punica-form/commit/d48b9c84e2d6a220266c340a28db170e92ec9a3a)]:
  - @punica/form@1.2.0
