# @punica/form-mcp

## 0.10.1

### Patch Changes

- [#142](https://github.com/punicalab/punica-form/pull/142) [`99341db`](https://github.com/punicalab/punica-form/commit/99341dbf7c1d16dc248a76c736fd7aea56da03a9) Thanks [@punicalab](https://github.com/punicalab)! - The guide opens with where exact declarations come from: `get_api` (with the types a declaration refers to) and `search_api`, instead of the `.d.ts` files in `node_modules`.

## 0.10.0

### Minor Changes

- [#138](https://github.com/punicalab/punica-form/pull/138) [`e62fdc6`](https://github.com/punicalab/punica-form/commit/e62fdc68e057f3114730ed805cf10519219f0c4b) Thanks [@punicalab](https://github.com/punicalab)! - Documents what assistants had to read the built code for. form-kit: `Rules` says when the rules run and that an empty value is only checked by `required` (and a list by `minItems`); `FieldProps` lists what a field takes and what `required` means; `ArrayField` names its buttons' `addLabel` and `removeLabel` with an example; `FormView` says what `onSubmit` receives and how to read the values outside a submit. form: `required` of a form item is documented. form-mcp: `get_api` of a type made of other types (`FieldProps = Omit<KitItem, …>`) brings the types of its module it names, exported or not, so the options of a field are in one answer; search still reads only an export's own text.

## 0.9.0

### Minor Changes

- [#134](https://github.com/punicalab/punica-form/pull/134) [`8458a7e`](https://github.com/punicalab/punica-form/commit/8458a7e997a550f098641c431d62f5ea684085c3) Thanks [@punicalab](https://github.com/punicalab)! - `get_api` answers a name that is no export with what it is about: `TextFieldOptions` returns the declaration of `TextField`, and other names list the closest exports first. `ArrayField` and `FieldArray` say how the rows start from the value of the property (an element names only what differs from the row class; `minItems` adds no rows).

## 0.8.0

### Minor Changes

- [#130](https://github.com/punicalab/punica-form/pull/130) [`3ab1058`](https://github.com/punicalab/punica-form/commit/3ab105891b0dad4996f057e556ff4019cb4d567e) Thanks [@punicalab](https://github.com/punicalab)! - `get_api` brings the types a declaration is made of that are not exported (`FormViewProps` comes with `ViewProps`), and a name asked for that is such a type returns its declaration and the exports that hold it, in place of the list of every export. `FormView` says what it draws and where the errors of the form go; `Submit` says it clears them first.

## 0.7.0

### Minor Changes

- [#126](https://github.com/punicalab/punica-form/pull/126) [`9131367`](https://github.com/punicalab/punica-form/commit/91313677ed29a63ca68455ee5f2c769513cc2c0b) Thanks [@punicalab](https://github.com/punicalab)! - A `TextField` with `inputType: 'email'` or `'url'` takes only an email address or an absolute URL, as the browser's inputs do. The kit's form does not let the browser validate (`noValidate`), so until now such a field took any text unless it had a `pattern`. A field with a `pattern` of its own keeps it: the pattern decides, with its message. The messages are `email` and `url`, replaceable with `setMessages` or a field's `messages`.

## 0.6.2

### Patch Changes

- [#123](https://github.com/punicalab/punica-form/pull/123) [`653c63f`](https://github.com/punicalab/punica-form/commit/653c63f1ec6ec4cd8b2a61a17b2218aaed789507) Thanks [@punicalab](https://github.com/punicalab)! - The server's copy of the packages, for a project that has not installed them, is that of form-kit 0.6.1 (it was 0.6.0).

## 0.6.1

### Patch Changes

- [#115](https://github.com/punicalab/punica-form/pull/115) [`4b01c32`](https://github.com/punicalab/punica-form/commit/4b01c3295fdfdccb2c7d47a8a54beced90595327) Thanks [@punicalab](https://github.com/punicalab)! - `bindForm` of `@punica/form-kit/dom` takes three more options. `refusal(err)` reads the fields a failed `onSubmit` names (a server that refused some of them), shows them on those fields, focuses the first, and leaves `alert` only what named no field; `failed(err, named)` is told how many it marked. `customRules` adds rules of your own beside the built-in ones, by the names `rules` uses. `problemMessage(problem)` gives the words for a control that is wrong and has no message of its own (`required`, `invalid`); a control's own `validationMessage` still comes first.
  
  The subpaths resolve under TypeScript's `moduleResolution: "node"` too: `@punica/form-kit/dom`, `/react`, `/json` and `@punica/form-json/definition` are listed in `typesVersions`.
- Updated dependencies [[`4b01c32`](https://github.com/punicalab/punica-form/commit/4b01c3295fdfdccb2c7d47a8a54beced90595327)]:
  - @punica/form-json@0.2.1

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
