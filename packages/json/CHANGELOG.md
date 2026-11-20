# @punica/form-json

## 0.1.0

### Minor Changes

- New package: forms as data. A form definition in JSON, made for forms a language model writes at run time.
  - `fromSchema(definition, { types, rules })` creates the controller of a definition; `FormDefinitionError` lists the problems of one that is not valid.
  - Named rules (`required`, `email`, `min`, `max`, `minLength`, `maxLength`, `pattern`, and your own) and declarative conditions (`visibleWhen`, `disabledWhen`). A definition holds no code.
  - `validateDefinition`, `fromJsonSchema` and `formDefinitionSchema` in `@punica/form-json/definition`, which needs nothing else; the schema is also the file `schema.json`.
