---
'@punica/form-kit': minor
---

`@FormKit` adds the `Touch` and `Submit` services. `KitForm` submits through `Submit`: what `onSubmit` throws is shown above the fields as an error of the form, in addition to being given to `onError`. Fields are marked as touched when they are left.

`FormView` now needs the `Touch` and `Submit` services. Forms of a `@FormKit` class have them; a controller built with your own `@Services` list has to add both.
