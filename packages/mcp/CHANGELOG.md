# @punica/form-mcp

## 0.6.0

### Minor Changes

- [#111](https://github.com/punicalab/punica-form/pull/111) [`7869496`](https://github.com/punicalab/punica-form/commit/7869496a07401fe83b280d573ba4a06063d524f4) Thanks [@punicalab](https://github.com/punicalab)! - `@punica/form-kit/dom`: `bindForm(form, { fields, rules, onSubmit, alert })` binds a form you draw yourself (your own DOM, @punica/components or native controls, no React) to the engine. The engine holds the value of each named control as it is typed or chosen; a submit checks the engine's rules and each control's own constraints in the control's own words, shows them on its `punica-field`, focuses the first wrong control, holds the submit buttons while `onSubmit` works and says what it threw in `alert` (or gives it to `failed`). `submitOnEnter: false` leaves submitting to the page's buttons, `set(name, value)` writes into the engine and the control, `dispose()` lets the form go. React and `@punica/form-react` are optional peers now: only `@punica/form-kit/react` and `/json` need them.
  
  The MCP server knows the new entry point, and its guide says when to use it.

## 0.5.0

### Minor Changes

- [#104](https://github.com/punicalab/punica-form/pull/104) [`fbd132b`](https://github.com/punicalab/punica-form/commit/fbd132b2d779e210259e470897a5f9c148e5ffba) Thanks [@punicalab](https://github.com/punicalab)! - `SetErrors`, a service that shows errors found outside the form on the items they are about: what a server refused with messages by field.
  
  ```ts
  const rest = await controller.getService(SetErrors).run({
    email: ['This email is already registered'],
    'lines.1.price': ['Too high'],
    capacity: ['Only 10 seats are left']
  });
  // rest: ['Only 10 seats are left'], the messages that name no item
  ```
  
  A name is a property of the form; `lines.1.price` (or `lines[1].price`) is an item of a row of a list, and nested objects and arrays say the same. Such an error goes when its item is validated again, also when the item has no validation of its own, and with `ClearError`, `ClearErrors`, `ResetItem` and `Reset`; a validation that was running when it was set does not erase it. `@FormKit`, `fromSchema` and `JsonForm` list the service, and the MCP server's guide shows how to use it in a submit handler.

### Patch Changes

- [#105](https://github.com/punicalab/punica-form/pull/105) [`4da11f1`](https://github.com/punicalab/punica-form/commit/4da11f15a912fba617d46974fff55faa9e2ddb5a) Thanks [@punicalab](https://github.com/punicalab)! - The guide says where Punica Form meets Punica Request and Punica Components (choices and validations that ask a server, what a server refuses, submitting) and points to an application on the three.
- Updated dependencies [[`fbd132b`](https://github.com/punicalab/punica-form/commit/fbd132b2d779e210259e470897a5f9c148e5ffba)]:
  - @punica/form-json@0.2.0

## 0.4.0

### Minor Changes

- [#92](https://github.com/punicalab/punica-form/pull/92) [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c) Thanks [@punicalab](https://github.com/punicalab)! - The guide covers lists of rows: the `row` function of a form item, the `FieldArray` service and `useFieldArray`.

- [#87](https://github.com/punicalab/punica-form/pull/87) [`23812b8`](https://github.com/punicalab/punica-form/commit/23812b8d6892bc4c2f85add6496f31cf6dfa0710) Thanks [@punicalab](https://github.com/punicalab)! - Forms as data.
  
  - `@punica/form-kit/json`: `<JsonForm definition={…} />` checks a form definition and renders it with the components of the kit. It needs `@punica/form-json`, an optional peer of the kit.
  - `@punica/form-react`: `useController(create)` starts a controller you create yourself; `useFormController` is built on it.
  - `@punica/form-mcp`: new tools `get_form_schema` and `validate_form`; the server knows `@punica/form-json` and `@punica/form-kit/json`.

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - The server knows `@punica/form-schema`, and the guide covers validation with a schema.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - The guide covers the form state of 2.2: `dirty`, `touched`, `form.state`, the `Touch` and `Submit` services and `useFormState`.

### Patch Changes

- [#98](https://github.com/punicalab/punica-form/pull/98) [`a972867`](https://github.com/punicalab/punica-form/commit/a972867e877021f7918eab90a5a6797619d45a79) Thanks [@punicalab](https://github.com/punicalab)! - `search_api` shows the first sentence of an export's documentation. The marks of the comment it is written in (`*`, `*/`) used to come along, and a sentence that went over two lines was cut at the first.

- [#86](https://github.com/punicalab/punica-form/pull/86) [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550) Thanks [@punicalab](https://github.com/punicalab)! - The guide explains `defineForm` and when to prefer it over a decorated class; it also covers cancelling and delaying validations.

- [#94](https://github.com/punicalab/punica-form/pull/94) [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761) Thanks [@punicalab](https://github.com/punicalab)! - `deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. When rows are added, removed or moved, the validation of the list item itself is asked again, without validating the rows: what it found was about other rows. A list is created once, also when `FieldArray` is listed twice. The MCP server knows the new fields of the form kit.
- Updated dependencies [[`c61306a`](https://github.com/punicalab/punica-form/commit/c61306a9ae9c33c2bd9ac645b3684b5521c45156)]:
  - @punica/form-json@0.1.0

## 0.4.0-next.1

### Minor Changes

- [#92](https://github.com/punicalab/punica-form/pull/92) [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c) Thanks [@punicalab](https://github.com/punicalab)! - The guide covers lists of rows: the `row` function of a form item, the `FieldArray` service and `useFieldArray`.

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - The server knows `@punica/form-schema`, and the guide covers validation with a schema.

### Patch Changes

- [#94](https://github.com/punicalab/punica-form/pull/94) [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761) Thanks [@punicalab](https://github.com/punicalab)! - `deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. When rows are added, removed or moved, the validation of the list item itself is asked again, without validating the rows: what it found was about other rows. A list is created once, also when `FieldArray` is listed twice. The MCP server knows the new fields of the form kit.

## 0.4.0-next.0

### Minor Changes

- [#87](https://github.com/punicalab/punica-form/pull/87) [`23812b8`](https://github.com/punicalab/punica-form/commit/23812b8d6892bc4c2f85add6496f31cf6dfa0710) Thanks [@punicalab](https://github.com/punicalab)! - Forms as data.
  
  - `@punica/form-kit/json`: `<JsonForm definition={…} />` checks a form definition and renders it with the components of the kit. It needs `@punica/form-json`, an optional peer of the kit.
  - `@punica/form-react`: `useController(create)` starts a controller you create yourself; `useFormController` is built on it.
  - `@punica/form-mcp`: new tools `get_form_schema` and `validate_form`; the server knows `@punica/form-json` and `@punica/form-kit/json`.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - The guide covers the form state of 2.2: `dirty`, `touched`, `form.state`, the `Touch` and `Submit` services and `useFormState`.

### Patch Changes

- [#86](https://github.com/punicalab/punica-form/pull/86) [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550) Thanks [@punicalab](https://github.com/punicalab)! - The guide explains `defineForm` and when to prefer it over a decorated class; it also covers cancelling and delaying validations.
- Updated dependencies [[`c61306a`](https://github.com/punicalab/punica-form/commit/c61306a9ae9c33c2bd9ac645b3684b5521c45156)]:
  - @punica/form-json@0.1.0-next.0

## 0.3.1

### Patch Changes

- [#81](https://github.com/punicalab/punica-form/pull/81) [`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486) Thanks [@punicalab](https://github.com/punicalab)! - The server knows the types the kit exports (`KitItem`, `FieldProps`, `Option`, …): `validate_code` reported them as not exported.

## 0.3.0

### Minor Changes

- [#78](https://github.com/punicalab/punica-form/pull/78) [`8e515cc`](https://github.com/punicalab/punica-form/commit/8e515ccad3614795c4ac97df054446e80f2b5786) Thanks [@punicalab](https://github.com/punicalab)! - The server now knows `@punica/form-react` and `@punica/form-kit` (including `@punica/form-kit/react`): `search_api`, `get_api` and the import check of `validate_code` cover them, and the guide describes the ready-made form system.

## 0.2.1

### Patch Changes

- [#62](https://github.com/punicalab/punica-form/pull/62) [`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122) Thanks [@punicalab](https://github.com/punicalab)! - Do not steer projects that still have Punica Form 1.x installed into the 2.x API: the removed-API rules are skipped and the guide says which version it describes.

## 0.2.1-next.0

### Patch Changes

- [#62](https://github.com/punicalab/punica-form/pull/62) [`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122) Thanks [@punicalab](https://github.com/punicalab)! - Do not steer projects that still have Punica Form 1.x installed into the 2.x API: the removed-API rules are skipped and the guide says which version it describes.

## 0.2.0

### Minor Changes

- [#59](https://github.com/punicalab/punica-form/pull/59) [`54f34bc`](https://github.com/punicalab/punica-form/commit/54f34bc4ba3ac90bc9d72b5fa084b5b8f8563b84) Thanks [@punicalab](https://github.com/punicalab)! - Teach the guide and `validate_code` the API of Punica Form 2. The validator now also reports the removed 1.x API (`getServices`, `item.setValue`, `controller.off`, `FormItemRegister.getInstance`, `Reflect.getMetadata`) with its replacement.

## 0.1.0

### Minor Changes

- [#52](https://github.com/punicalab/punica-form/pull/52) [`d48b9c8`](https://github.com/punicalab/punica-form/commit/d48b9c84e2d6a220266c340a28db170e92ec9a3a) Thanks [@punicalab](https://github.com/punicalab)! - Add `@punica/form-mcp`, an MCP server that lets AI assistants look up the exact API of Punica Form, read its rules and check the code they write.
