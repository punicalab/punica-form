# @punica/form-mcp

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
