---
'@punica/form-kit': minor
'@punica/form-mcp': minor
---

`@punica/form-kit/dom`: `bindForm(form, { fields, rules, onSubmit, alert })` binds a form you draw yourself (your own DOM, @punica/components or native controls, no React) to the engine. The engine holds the value of each named control as it is typed or chosen; a submit checks the engine's rules and each control's own constraints in the control's own words, shows them on its `punica-field`, focuses the first wrong control, holds the submit buttons while `onSubmit` works and says what it threw in `alert` (or gives it to `failed`). `submitOnEnter: false` leaves submitting to the page's buttons, `set(name, value)` writes into the engine and the control, `dispose()` lets the form go. React and `@punica/form-react` are optional peers now: only `@punica/form-kit/react` and `/json` need them.

The MCP server knows the new entry point, and its guide says when to use it.
