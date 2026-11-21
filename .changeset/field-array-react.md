---
'@punica/form-react': minor
---

`useFieldArray(controller, property)` returns the rows of a list and the functions that change it. The component renders again when a row is added, removed or moved; a value that changes renders the row it belongs to. The hook uses the `FieldArray` service, so `@punica/form-service` is a peer dependency now.
