---
'@punica/form': patch
'@punica/form-service': patch
'@punica/form-mcp': patch
---

`deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. When rows are added, removed or moved, the validation of the list item itself is asked again, without validating the rows: what it found was about other rows. A list is created once, also when `FieldArray` is listed twice. The MCP server knows the new fields of the form kit.
