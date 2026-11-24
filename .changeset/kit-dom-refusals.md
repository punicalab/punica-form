---
'@punica/form-kit': minor
'@punica/form-json': patch
'@punica/form-mcp': patch
---

`bindForm` of `@punica/form-kit/dom` takes three more options. `refusal(err)` reads the fields a failed `onSubmit` names (a server that refused some of them), shows them on those fields, focuses the first, and leaves `alert` only what named no field; `failed(err, named)` is told how many it marked. `customRules` adds rules of your own beside the built-in ones, by the names `rules` uses. `problemMessage(problem)` gives the words for a control that is wrong and has no message of its own (`required`, `invalid`); a control's own `validationMessage` still comes first.

The subpaths resolve under TypeScript's `moduleResolution: "node"` too: `@punica/form-kit/dom`, `/react`, `/json` and `@punica/form-json/definition` are listed in `typesVersions`.
