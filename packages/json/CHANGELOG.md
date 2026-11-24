# @punica/form-json

## 0.2.1

### Patch Changes

- [#115](https://github.com/punicalab/punica-form/pull/115) [`4b01c32`](https://github.com/punicalab/punica-form/commit/4b01c3295fdfdccb2c7d47a8a54beced90595327) Thanks [@punicalab](https://github.com/punicalab)! - `bindForm` of `@punica/form-kit/dom` takes three more options. `refusal(err)` reads the fields a failed `onSubmit` names (a server that refused some of them), shows them on those fields, focuses the first, and leaves `alert` only what named no field; `failed(err, named)` is told how many it marked. `customRules` adds rules of your own beside the built-in ones, by the names `rules` uses. `problemMessage(problem)` gives the words for a control that is wrong and has no message of its own (`required`, `invalid`); a control's own `validationMessage` still comes first.
  
  The subpaths resolve under TypeScript's `moduleResolution: "node"` too: `@punica/form-kit/dom`, `/react`, `/json` and `@punica/form-json/definition` are listed in `typesVersions`.

## 0.2.0

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

- Updated dependencies [[`fbd132b`](https://github.com/punicalab/punica-form/commit/fbd132b2d779e210259e470897a5f9c148e5ffba)]:
  - @punica/form-service@2.3.0
  - @punica/form@2.3.0

## 0.1.0

### Minor Changes

- [#88](https://github.com/punicalab/punica-form/pull/88) [`c61306a`](https://github.com/punicalab/punica-form/commit/c61306a9ae9c33c2bd9ac645b3684b5521c45156) Thanks [@punicalab](https://github.com/punicalab)! - New package: forms as data. A form definition in JSON, made for forms a language model writes at run time.
  
  - `fromSchema(definition, { types, rules })` creates the controller of a definition; `FormDefinitionError` lists the problems of one that is not valid.
  - Named rules (`required`, `email`, `integer`, `min`, `max`, `minLength`, `maxLength`, `pattern`, and your own) and declarative conditions (`visibleWhen`, `disabledWhen`). A definition holds no code.
  - `validateDefinition`, `fromJsonSchema` and `formDefinitionSchema` in `@punica/form-json/definition`, which needs nothing else; the schema is also the file `schema.json`.

### Patch Changes

- Updated dependencies [[`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550), [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628), [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441), [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761)]:
  - @punica/form@2.2.0
  - @punica/form-service@2.2.0

## 0.1.0-next.0

### Minor Changes

- [#88](https://github.com/punicalab/punica-form/pull/88) [`c61306a`](https://github.com/punicalab/punica-form/commit/c61306a9ae9c33c2bd9ac645b3684b5521c45156) Thanks [@punicalab](https://github.com/punicalab)! - New package: forms as data. A form definition in JSON, made for forms a language model writes at run time.
  
  - `fromSchema(definition, { types, rules })` creates the controller of a definition; `FormDefinitionError` lists the problems of one that is not valid.
  - Named rules (`required`, `email`, `integer`, `min`, `max`, `minLength`, `maxLength`, `pattern`, and your own) and declarative conditions (`visibleWhen`, `disabledWhen`). A definition holds no code.
  - `validateDefinition`, `fromJsonSchema` and `formDefinitionSchema` in `@punica/form-json/definition`, which needs nothing else; the schema is also the file `schema.json`.

### Patch Changes

- Updated dependencies [[`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628)]:
  - @punica/form@2.2.0-next.0
  - @punica/form-service@2.2.0-next.0
