---
'@punica/form': patch
'@punica/form-service': patch
'@punica/form-mcp': patch
---

`deepCopy` keeps files (`File`, `Blob`) by reference, so a form that holds one can be reset and its rows copied. What the validation of a list item itself found is forgotten when rows are added, removed or moved: it was about other rows. The MCP server knows the new fields of the form kit.
