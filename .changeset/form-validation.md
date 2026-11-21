---
'@punica/form': minor
'@punica/form-service': minor
---

Validations of a form as a whole: a service adds one with `addFormValidation(command, () => messages)`. `Validate` and `Submit` run them after the items; their messages become the errors of the form (`state.errors`), and a form that has some is not valid and not submitted.

`defineForm` accepts class decorators that ask for the entity they are made for, as `Schema` of `@punica/form-schema` does.
