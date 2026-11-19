---
'@punica/form': minor
'@punica/form-service': minor
---

Fixes from a review of 2.0, and a more robust core. No breaking changes.

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
