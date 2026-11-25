---
'@punica/form-mcp': minor
'@punica/form-kit': patch
'@punica/form-service': patch
---

`get_api` brings the types a declaration is made of that are not exported (`FormViewProps` comes with `ViewProps`), and a name asked for that is such a type returns its declaration and the exports that hold it, in place of the list of every export. `FormView` says what it draws and where the errors of the form go; `Submit` says it clears them first.
