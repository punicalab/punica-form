# @punica/form-schema

## 0.1.0

### Minor Changes

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - Validate forms with the schemas you already have. The package is written against Standard Schema, so Zod, Valibot, ArkType, Yup and every other library that implements it work as they are, and it has no dependency of its own.
  
  `@Schema(schema)` gives a form class its schema and the `SchemaValidation` service applies it: every issue is shown on the item its path is about, and issues that belong to no item become errors of the form. A class whose properties do not have the types the schema takes does not compile. `schema(schema)` is the validation of one item, and `SchemaValidation.of(schema)` serves forms that are not made from a class.

### Patch Changes

- Updated dependencies [[`4866c54`](https://github.com/punicalab/punica-form/commit/4866c544a2401d9913afc42733326395b42d89a0), [`b806d2f`](https://github.com/punicalab/punica-form/commit/b806d2f86d39d2ee3c68f32ceac0acee5d7fd550), [`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c), [`5eadc29`](https://github.com/punicalab/punica-form/commit/5eadc29df7b37ea45c9f80e248d3c4273c3ad628), [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441), [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761)]:
  - @punica/form@2.2.0
  - @punica/form-service@2.2.0

## 0.1.0-next.0

### Minor Changes

- [#93](https://github.com/punicalab/punica-form/pull/93) [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441) Thanks [@punicalab](https://github.com/punicalab)! - Validate forms with the schemas you already have. The package is written against Standard Schema, so Zod, Valibot, ArkType, Yup and every other library that implements it work as they are, and it has no dependency of its own.
  
  `@Schema(schema)` gives a form class its schema and the `SchemaValidation` service applies it: every issue is shown on the item its path is about, and issues that belong to no item become errors of the form. A class whose properties do not have the types the schema takes does not compile. `schema(schema)` is the validation of one item, and `SchemaValidation.of(schema)` serves forms that are not made from a class.

### Patch Changes

- Updated dependencies [[`c6aafbd`](https://github.com/punicalab/punica-form/commit/c6aafbdcea7b438f7ecd275e6eb8d403673fb95c), [`dc61d18`](https://github.com/punicalab/punica-form/commit/dc61d1839b0155e883e7b383f9f16dd587e24441), [`a1f2274`](https://github.com/punicalab/punica-form/commit/a1f227425f8f06bdaa37b10a5f1c7363d053d761)]:
  - @punica/form@2.2.0-next.1
  - @punica/form-service@2.2.0-next.1
