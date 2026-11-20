---
'@punica/form-kit': minor
'@punica/form-react': minor
'@punica/form-mcp': minor
---

Forms as data.

- `@punica/form-kit/json`: `<JsonForm definition={…} />` checks a form definition and renders it with the components of the kit. It needs `@punica/form-json`, an optional peer of the kit.
- `@punica/form-react`: `useController(create)` starts a controller you create yourself; `useFormController` is built on it.
- `@punica/form-mcp`: new tools `get_form_schema` and `validate_form`; the server knows `@punica/form-json` and `@punica/form-kit/json`.
