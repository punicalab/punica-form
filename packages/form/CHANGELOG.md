# @punica/form

## 2.3.3

### Patch Changes

- [#138](https://github.com/punicalab/punica-form/pull/138) [`e62fdc6`](https://github.com/punicalab/punica-form/commit/e62fdc68e057f3114730ed805cf10519219f0c4b) Thanks [@punicalab](https://github.com/punicalab)! - Documents what assistants had to read the built code for. form-kit: `Rules` says when the rules run and that an empty value is only checked by `required` (and a list by `minItems`); `FieldProps` lists what a field takes and what `required` means; `ArrayField` names its buttons' `addLabel` and `removeLabel` with an example; `FormView` says what `onSubmit` receives and how to read the values outside a submit. form: `required` of a form item is documented. form-mcp: `get_api` of a type made of other types (`FieldProps = Omit<KitItem, …>`) brings the types of its module it names, exported or not, so the options of a field are in one answer; search still reads only an export's own text.

## 2.3.2

No changes in this release.

## 2.3.1

No changes in this release.

## 2.3.0

No changes in this release.

## 2.2.0

### Minor Changes

- [#85](https://github.com/punicalab/punica-form/pull/85) [`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0) Thanks [@punicalab](https://github.com/punicalab)! - Asynchronous validations can be cancelled and delayed.
  
  - Validation functions receive a second argument, `{ signal }`. The signal is aborted when the item is validated again, changed or reset, so `fetch(url, { signal: context?.signal })` cancels the request. A validation that rejects after it was aborted no longer rejects the service.
  - `validateDebounce` on an item makes `Trigger` wait and validate once after the last trigger. `Validate` and `Submit` do not wait and take the place of a waiting validation.
  - Items whose validation takes a while are `validating`, and so is `state.validating` of the form. Validations that do not wait for anything still notify once.
  - `Validate` and `Submit` validate every item as it is when its turn comes, validate an item again when it changes meanwhile, and return `false` when the form is reset meanwhile. A result is never written onto a value it was not made for.
  
  Validation functions with one parameter keep working.

- [#86](https://github.com/punicalab/punica-form/pull/86) [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550) Thanks [@punicalab](https://github.com/punicalab)! - Forms without decorator syntax.
  
  - New `defineForm(fields, ...classDecorators)` and `field(value, ...propertyDecorators)` define a form class in projects whose build does not compile decorators. Every existing decorator (`Services`, the field decorators of the kit, your own) is used as a function call; the class takes initial values in its constructor and its instance type follows from the fields.
  - `FormController.fromEntity` warns when a class has no form items, the usual sign of a build that does not apply decorators.

- [#92](https://github.com/punicalab/punica-form/pull/92) [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c) Thanks [@punicalab](https://github.com/punicalab)! - Lists of rows, such as the lines of an invoice. A form item with a `row` function is a list: the new `FieldArray` service creates a form of its own for every row, from the entity `row` returns, and offers `rows`, `append`, `insert`, `remove`, `move` and `replace`. The value of the item is the array of the values of its rows.
  
  The list takes part in the form: `Validate` and `Submit` validate its rows, the item is dirty, touched and in error when a row is, `Reset` and `ResetItem` bring back the rows the form was started with, `SetValue` replaces them, and `ClearErrors` clears their errors. A row class without `@Services` gets the services of the form around it, through the new `services` option of `FormController.fromEntity`.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - The form knows its own state.
  
  - Items have `dirty` (the value differs from the one the form was started with, compared deeply) and `touched` (set by the new `Touch` service). `Reset` and `ResetItem` clear both.
  - A started form has `state`: `{ dirty, touched, valid, submitting, submitCount, errors }`. The first three follow from the items; the object keeps its identity while nothing in it changes.
  - New `Submit` service: `run(handler)` validates the form, calls the handler with its values, ignores a second submit while one is running and turns what the handler throws into `state.errors`.
  - New events `SUBMIT` and `SUBMIT_ERROR`.
  - `CommandService.setState` for services that write `submitting`, `submitCount` or `errors`; `isEqual` is exported.
  
  The new fields are optional and the new services are opt-in. One thing to check: `state` on a form and `dirty` / `touched` on an item are now written by the library, so a form system that used these names for data of its own has to rename it.

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - Validations of a form as a whole: a service adds one with `addFormValidation(command, () => messages)`. `Validate` and `Submit` run them after the items; their messages are added to the errors of the form (`state.errors`), and a form that has some is not valid (`state.valid`) and not submitted. `Reset` and `ClearErrors` remove them.
  
  `wrapValidation(command, wrap)` lets a service add a validation of its own to the items of a form, lists included. A service class with `static forRows = false` is not given to the rows of a list.
  
  `defineForm` accepts class decorators that ask for the entity they are made for, as `Schema` of `@punica/form-schema` does.

### Patch Changes

- [#94](https://github.com/punicalab/punica-form/pull/94) [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761) Thanks [@punicalab](https://github.com/punicalab)! - `deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. When rows are added, removed or moved, the validation of the list item itself is asked again, without validating the rows: what it found was about other rows. A list is created once, also when `FieldArray` is listed twice. The MCP server knows the new fields of the form kit.

## 2.2.0-next.1

### Minor Changes

- [#92](https://github.com/punicalab/punica-form/pull/92) [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c) Thanks [@punicalab](https://github.com/punicalab)! - Lists of rows, such as the lines of an invoice. A form item with a `row` function is a list: the new `FieldArray` service creates a form of its own for every row, from the entity `row` returns, and offers `rows`, `append`, `insert`, `remove`, `move` and `replace`. The value of the item is the array of the values of its rows.
  
  The list takes part in the form: `Validate` and `Submit` validate its rows, the item is dirty, touched and in error when a row is, `Reset` and `ResetItem` bring back the rows the form was started with, `SetValue` replaces them, and `ClearErrors` clears their errors. A row class without `@Services` gets the services of the form around it, through the new `services` option of `FormController.fromEntity`.

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - Validations of a form as a whole: a service adds one with `addFormValidation(command, () => messages)`. `Validate` and `Submit` run them after the items; their messages are added to the errors of the form (`state.errors`), and a form that has some is not valid (`state.valid`) and not submitted. `Reset` and `ClearErrors` remove them.
  
  `wrapValidation(command, wrap)` lets a service add a validation of its own to the items of a form, lists included. A service class with `static forRows = false` is not given to the rows of a list.
  
  `defineForm` accepts class decorators that ask for the entity they are made for, as `Schema` of `@punica/form-schema` does.

### Patch Changes

- [#94](https://github.com/punicalab/punica-form/pull/94) [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761) Thanks [@punicalab](https://github.com/punicalab)! - `deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. When rows are added, removed or moved, the validation of the list item itself is asked again, without validating the rows: what it found was about other rows. A list is created once, also when `FieldArray` is listed twice. The MCP server knows the new fields of the form kit.

## 2.2.0-next.0

### Minor Changes

- [#85](https://github.com/punicalab/punica-form/pull/85) [`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0) Thanks [@punicalab](https://github.com/punicalab)! - Asynchronous validations can be cancelled and delayed.
  
  - Validation functions receive a second argument, `{ signal }`. The signal is aborted when the item is validated again, changed or reset, so `fetch(url, { signal: context?.signal })` cancels the request. A validation that rejects after it was aborted no longer rejects the service.
  - `validateDebounce` on an item makes `Trigger` wait and validate once after the last trigger. `Validate` and `Submit` do not wait and take the place of a waiting validation.
  - Items whose validation takes a while are `validating`, and so is `state.validating` of the form. Validations that do not wait for anything still notify once.
  - `Validate` and `Submit` validate every item as it is when its turn comes, validate an item again when it changes meanwhile, and return `false` when the form is reset meanwhile. A result is never written onto a value it was not made for.
  
  Validation functions with one parameter keep working.

- [#86](https://github.com/punicalab/punica-form/pull/86) [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550) Thanks [@punicalab](https://github.com/punicalab)! - Forms without decorator syntax.
  
  - New `defineForm(fields, ...classDecorators)` and `field(value, ...propertyDecorators)` define a form class in projects whose build does not compile decorators. Every existing decorator (`Services`, the field decorators of the kit, your own) is used as a function call; the class takes initial values in its constructor and its instance type follows from the fields.
  - `FormController.fromEntity` warns when a class has no form items, the usual sign of a build that does not apply decorators.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - The form knows its own state.
  
  - Items have `dirty` (the value differs from the one the form was started with, compared deeply) and `touched` (set by the new `Touch` service). `Reset` and `ResetItem` clear both.
  - A started form has `state`: `{ dirty, touched, valid, submitting, submitCount, errors }`. The first three follow from the items; the object keeps its identity while nothing in it changes.
  - New `Submit` service: `run(handler)` validates the form, calls the handler with its values, ignores a second submit while one is running and turns what the handler throws into `state.errors`.
  - New events `SUBMIT` and `SUBMIT_ERROR`.
  - `CommandService.setState` for services that write `submitting`, `submitCount` or `errors`; `isEqual` is exported.
  
  The new fields are optional and the new services are opt-in. One thing to check: `state` on a form and `dirty` / `touched` on an item are now written by the library, so a form system that used these names for data of its own has to rename it.

## 2.1.1

### Patch Changes

- [#81](https://github.com/punicalab/punica-form/pull/81) [`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486) Thanks [@punicalab](https://github.com/punicalab)! - Fixes found by a review of 2.1:
  
  - A subscriber that throws inside `batch` no longer stops every later notification of the form.
  - A slow validation no longer writes its result onto a newer value, a newer validation of the same item, or a form that was reset in the meantime.
  - Disabled items are not validated, like hidden ones: a disabled required field that is empty no longer blocks `Validate`.

## 2.1.0

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
