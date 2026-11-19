# @punica/form

## 1.2.0

### Minor Changes

- [#52](https://github.com/punicalab/punica-form/pull/52) [`d48b9c8`](https://github.com/punicalab/punica-form/commit/d48b9c84e2d6a220266c340a28db170e92ec9a3a) Thanks [@punicalab](https://github.com/punicalab)! - Fix `Reset` and `ResetItem`, harden the DevTools bridge and stop swallowing service errors.
  
  - `Reset` and `ResetItem` restore the initial items; `Reset` now also fires the `RESET` event.
  - Services are initialized after readers and starters and always see the current form.
  - `deepCopy` keeps functions and prototypes and supports circular references. `deepCopyFunction` and `deepCopySpecialTypes` are removed.
  - Service errors reject instead of being logged; unknown properties fail with `Item not found`.
  - `GetValues` no longer mutates the initial entity.
  - `REGISTER_ITEMS` is fired with a `string[]`.
  - DevTools messages are marked, carry `formItemKey` and are posted to the page origin only. Requires the matching DevTools extension.
  - `@punica/form` is a peer dependency of `@punica/form-service`.
