# @punica/form-react

## 0.2.0-next.0

### Minor Changes

- [#87](https://github.com/punicalab/punica-form/pull/87) [`23812b8`](https://github.com/punicalab/punica-form/commit/23812b8d6892bc4c2f85add6496f31cf6dfa0710) Thanks [@punicalab](https://github.com/punicalab)! - Forms as data.
  
  - `@punica/form-kit/json`: `<JsonForm definition={…} />` checks a form definition and renders it with the components of the kit. It needs `@punica/form-json`, an optional peer of the kit.
  - `@punica/form-react`: `useController(create)` starts a controller you create yourself; `useFormController` is built on it.
  - `@punica/form-mcp`: new tools `get_form_schema` and `validate_form`; the server knows `@punica/form-json` and `@punica/form-kit/json`.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - New `useFormState(controller)`: the state of the form as a whole (`dirty`, `touched`, `valid`, `submitting`, `submitCount`, `errors`). The component only renders again when that state changes.

### Patch Changes

- [#85](https://github.com/punicalab/punica-form/pull/85) [`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0) Thanks [@punicalab](https://github.com/punicalab)! - The `validation` of a kit field receives the `{ signal }` context; `useFormState` reports `validating`.
- Updated dependencies [[`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628)]:
  - @punica/form@2.2.0-next.0

## 0.1.1

### Patch Changes

- [#81](https://github.com/punicalab/punica-form/pull/81) [`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486) Thanks [@punicalab](https://github.com/punicalab)! - `useFormController` keeps the form it started first when its effect runs again (StrictMode, a hidden `<Activity>` shown again, Fast Refresh) instead of replacing it with a new, empty one. An entity factory that throws, and a failure without a reason, now arrive in `error`.
- Updated dependencies [[`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486)]:
  - @punica/form@2.1.1

## 0.1.0

### Minor Changes

- [#63](https://github.com/punicalab/punica-form/pull/63) [`a95ccb4`](https://github.com/punicalab/punica-form/commit/a95ccb41009c53d9cedebc4b0d517b40f047916e) Thanks [@punicalab](https://github.com/punicalab)! - Add `@punica/form-react`: `useFormController` creates and starts the controller of a form when a component mounts, `useForm` follows its immutable form.

### Patch Changes

- Updated dependencies [[`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122)]:
  - @punica/form@2.1.0

## 0.1.0-next.0

### Minor Changes

- [#63](https://github.com/punicalab/punica-form/pull/63) [`a95ccb4`](https://github.com/punicalab/punica-form/commit/a95ccb41009c53d9cedebc4b0d517b40f047916e) Thanks [@punicalab](https://github.com/punicalab)! - Add `@punica/form-react`: `useFormController` creates and starts the controller of a form when a component mounts, `useForm` follows its immutable form.

### Patch Changes

- Updated dependencies [[`e0c0542`](https://github.com/punicalab/punica-form/commit/e0c0542615c40f952caa77bc76ffb074937a1122)]:
  - @punica/form@2.1.0-next.0
