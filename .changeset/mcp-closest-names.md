---
'@punica/form-mcp': minor
'@punica/form-kit': patch
'@punica/form-service': patch
---

`get_api` answers a name that is no export with what it is about: `TextFieldOptions` returns the declaration of `TextField`, and other names list the closest exports first. `ArrayField` and `FieldArray` say how the rows start from the value of the property (an element names only what differs from the row class; `minItems` adds no rows).
