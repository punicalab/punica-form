---
'@punica/form': minor
'@punica/form-service': minor
---

Asynchronous validations can be cancelled and delayed.

- Validation functions receive a second argument, `{ signal }`. The signal is aborted when the item is validated again, changed or reset, so `fetch(url, { signal: context?.signal })` cancels the request. A validation that rejects after it was aborted no longer rejects the service.
- `validateDebounce` on an item makes `Trigger` wait and validate once after the last trigger. `Validate` and `Submit` do not wait and take the place of a waiting validation.
- Items whose validation takes a while are `validating`, and so is `state.validating` of the form. Validations that do not wait for anything still notify once.
- `Validate` and `Submit` validate every item as it is when its turn comes, validate an item again when it changes meanwhile, and return `false` when the form is reset meanwhile. A result is never written onto a value it was not made for.

Validation functions with one parameter keep working.
