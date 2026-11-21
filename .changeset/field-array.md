---
'@punica/form': minor
'@punica/form-service': minor
---

Lists of rows, such as the lines of an invoice. A form item with a `row` function is a list: the new `FieldArray` service creates a form of its own for every row, from the entity `row` returns, and offers `rows`, `append`, `insert`, `remove`, `move` and `replace`. The value of the item is the array of the values of its rows.

The list takes part in the form: `Validate` and `Submit` validate its rows, the item is dirty, touched and in error when a row is, `Reset` and `ResetItem` bring back the rows the form was started with, `SetValue` replaces them, and `ClearErrors` clears their errors. A row class without `@Services` gets the services of the form around it, through the new `services` option of `FormController.fromEntity`.
