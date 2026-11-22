# @punica/form-json

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
