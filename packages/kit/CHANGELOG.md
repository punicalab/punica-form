# @punica/form-kit

## 0.3.0-next.1

### Minor Changes

- [#94](https://github.com/punicalab/punica-form/pull/94) [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761) Thanks [@punicalab](https://github.com/punicalab)! - More fields: `RadioGroupField`, `MultiSelectField`, `DateField`, `PasswordField`, `FileField` and `ArrayField`, a list of rows that renders a form for every row with buttons to add and remove. New rules go with them: `minDate`, `maxDate`, `minItems`, `maxItems` and `maxFileSize`; a file field checks `accept` and a date field reports a text that is no date. In a form definition these rules are set with `props`. Form definitions of `@punica/form-json` may use the types `radio`, `date`, `multiselect`, `password` and `file`.
  
  `options` of a select, a multi-select or a radio group may be a function that loads the choices; the field shows that it is loading.
  
  A value that is chosen (a select, a radio group, a date, a file, a checkbox, a switch) is validated when it is chosen; what is typed is still validated when the field is left. `@FormKit` lists the `FieldArray` service, once also when you list it yourself. Text and password fields take `autocomplete`. Components receive the `controller` of their form, the `components` it is rendered with and `onError`.

### Patch Changes

- Updated dependencies [[`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c), [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c), [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441), [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761)]:
  - @punica/form-react@0.2.0-next.1
  - @punica/form@2.2.0-next.1
  - @punica/form-service@2.2.0-next.1

## 0.3.0-next.0

### Minor Changes

- [#87](https://github.com/punicalab/punica-form/pull/87) [`23812b8`](https://github.com/punicalab/punica-form/commit/23812b8d6892bc4c2f85add6496f31cf6dfa0710) Thanks [@punicalab](https://github.com/punicalab)! - Forms as data.
  
  - `@punica/form-kit/json`: `<JsonForm definition={…} />` checks a form definition and renders it with the components of the kit. It needs `@punica/form-json`, an optional peer of the kit.
  - `@punica/form-react`: `useController(create)` starts a controller you create yourself; `useFormController` is built on it.
  - `@punica/form-mcp`: new tools `get_form_schema` and `validate_form`; the server knows `@punica/form-json` and `@punica/form-kit/json`.

- [#84](https://github.com/punicalab/punica-form/pull/84) [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628) Thanks [@punicalab](https://github.com/punicalab)! - `@FormKit` adds the `Touch` and `Submit` services. `KitForm` submits through `Submit`: what `onSubmit` throws is shown above the fields as an error of the form, in addition to being given to `onError`. Fields are marked as touched when they are left.
  
  `FormView` now needs the `Touch` and `Submit` services. Forms of a `@FormKit` class have them; a controller built with your own `@Services` list has to add both.

### Patch Changes

- [#85](https://github.com/punicalab/punica-form/pull/85) [`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0) Thanks [@punicalab](https://github.com/punicalab)! - The `validation` of a kit field receives the `{ signal }` context; `useFormState` reports `validating`.
- Updated dependencies [[`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550), [`23812b8`](https://github.com/punicalab/punica-form/commit/23812b8d6892bc4c2f85add6496f31cf6dfa0710), [`c61306a`](https://github.com/punicalab/punica-form/commit/c61306a9ae9c33c2bd9ac645b3684b5521c45156), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628)]:
  - @punica/form-react@0.2.0-next.0
  - @punica/form@2.2.0-next.0
  - @punica/form-service@2.2.0-next.0
  - @punica/form-json@0.1.0-next.0

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
