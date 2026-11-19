---
'@punica/form': minor
'@punica/form-service': minor
---

Fix `Reset` and `ResetItem`, harden the DevTools bridge and stop swallowing service errors.

- `Reset` and `ResetItem` restore the initial items; `Reset` now also fires the `RESET` event.
- Services are initialized after readers and starters and always see the current form.
- `deepCopy` keeps functions and prototypes and supports circular references. `deepCopyFunction` and `deepCopySpecialTypes` are removed.
- Service errors reject instead of being logged; unknown properties fail with `Item not found`.
- `GetValues` no longer mutates the initial entity.
- `REGISTER_ITEMS` is fired with a `string[]`.
- DevTools messages are marked, carry `formItemKey` and are posted to the page origin only. Requires the matching DevTools extension.
- `@punica/form` is a peer dependency of `@punica/form-service`.
