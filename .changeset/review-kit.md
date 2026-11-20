---
'@punica/form-kit': minor
---

- New `onError` prop of `KitForm` and `FormView`: receives what a validation, a control function or `onSubmit` threw. These were unhandled promise rejections before; without the prop they are logged to the console.
- A form that is being submitted cannot be submitted again, for example with Enter in a field.
- A `pattern` with the `g` or `y` flag gives the same result on every validation.
- A field whose own `validation` returns an error without a message shows the message of an invalid value instead of blocking the form silently.
