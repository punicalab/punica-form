# @punica/form-kit

## 0.2.0

### Minor Changes

- [#81](https://github.com/punicalab/punica-form/pull/81) [`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486) Thanks [@punicalab](https://github.com/punicalab)! - - New `onError` prop of `KitForm` and `FormView`: receives what a validation, a control function or `onSubmit` threw. These were unhandled promise rejections before; without the prop they are logged to the console.
  - A form that is being submitted cannot be submitted again, for example with Enter in a field.
  - A `pattern` with the `g` or `y` flag gives the same result on every validation.
  - A field whose own `validation` returns an error without a message shows the message of an invalid value instead of blocking the form silently.

### Patch Changes

- Updated dependencies [[`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486), [`bac4bbe`](https://github.com/punicalab/punica-form/commit/bac4bbe3405b974d4a314c6bd024e281c7199486)]:
  - @punica/form@2.1.1
  - @punica/form-service@2.1.1
  - @punica/form-react@0.1.1

## 0.1.0

### Minor Changes

- [#75](https://github.com/punicalab/punica-form/pull/75) [`24337fc`](https://github.com/punicalab/punica-form/commit/24337fcb646807537d8e229d293d000fbf808084) Thanks [@punicalab](https://github.com/punicalab)! - Add `@punica/form-kit`, a ready-made form system: field decorators (`TextField`, `NumberField`, `TextAreaField`, `SelectField`, `CheckboxField`, `SwitchField`), built-in validation rules with replaceable messages, `@FormKit` to set a form up, and React components (`KitForm`, `FormView`) that render the form with `@punica/components`.
