---
'@punica/form-schema': minor
---

Validate forms with the schemas you already have. The package is written against Standard Schema, so Zod, Valibot, ArkType, Yup and every other library that implements it work as they are, and it has no dependency of its own.

`@Schema(schema)` gives a form class its schema and the `SchemaValidation` service applies it: every issue is shown on the item its path is about, and issues that belong to no item become errors of the form. A class whose properties do not have the types the schema takes does not compile. `schema(schema)` is the validation of one item, and `SchemaValidation.of(schema)` serves forms that are not made from a class.
