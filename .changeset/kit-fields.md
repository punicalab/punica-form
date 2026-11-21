---
'@punica/form-kit': minor
---

More fields: `RadioGroupField`, `MultiSelectField`, `DateField`, `PasswordField`, `FileField` and `ArrayField`, a list of rows that renders a form for every row with buttons to add and remove. New rules go with them: `minDate`, `maxDate`, `minItems`, `maxItems` and `maxFileSize`. Form definitions of `@punica/form-json` may use the types `radio`, `date`, `multiselect`, `password` and `file`.

`options` of a select, a multi-select or a radio group may be a function that loads the choices; the field shows that it is loading.

A value that is chosen (a select, a radio group, a date, a file, a checkbox, a switch) is validated when it is chosen; what is typed is still validated when the field is left. `@FormKit` lists the `FieldArray` service. Components receive the `controller` of their form, the `components` it is rendered with and `onError`.
