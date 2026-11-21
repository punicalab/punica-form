---
'@punica/form': minor
'@punica/form-service': minor
---

The form knows its own state.

- Items have `dirty` (the value differs from the one the form was started with, compared deeply) and `touched` (set by the new `Touch` service). `Reset` and `ResetItem` clear both.
- A started form has `state`: `{ dirty, touched, valid, submitting, submitCount, errors }`. The first three follow from the items; the object keeps its identity while nothing in it changes.
- New `Submit` service: `run(handler)` validates the form, calls the handler with its values, ignores a second submit while one is running and turns what the handler throws into `state.errors`.
- New events `SUBMIT` and `SUBMIT_ERROR`.
- `CommandService.setState` for services that write `submitting`, `submitCount` or `errors`; `isEqual` is exported.

The new fields are optional and the new services are opt-in. One thing to check: `state` on a form and `dirty` / `touched` on an item are now written by the library, so a form system that used these names for data of its own has to rename it.
