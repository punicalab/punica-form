---
'@punica/form': patch
'@punica/form-kit': patch
'@punica/form-mcp': minor
---

Documents what assistants had to read the built code for. form-kit: `Rules` says when the rules run and that an empty value is only checked by `required` (and a list by `minItems`); `FieldProps` lists what a field takes and what `required` means; `ArrayField` names its buttons' `addLabel` and `removeLabel` with an example; `FormView` says what `onSubmit` receives and how to read the values outside a submit. form: `required` of a form item is documented. form-mcp: `get_api` of a type made of other types (`FieldProps = Omit<KitItem, …>`) brings the types of its module it names, exported or not, so the options of a field are in one answer; search still reads only an export's own text.
