---
'@punica/form': minor
'@punica/form-service': minor
---

Validations of a form as a whole: a service adds one with `addFormValidation(command, () => messages)`. `Validate` and `Submit` run them after the items; their messages are added to the errors of the form (`state.errors`), and a form that has some is not valid (`state.valid`) and not submitted. `Reset` and `ClearErrors` remove them.

`wrapValidation(command, wrap)` lets a service add a validation of its own to the items of a form, lists included. A service class with `static forRows = false` is not given to the rows of a list.

`defineForm` accepts class decorators that ask for the entity they are made for, as `Schema` of `@punica/form-schema` does.
