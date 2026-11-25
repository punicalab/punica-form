---
'@punica/form-kit': minor
'@punica/form-mcp': minor
---

A `TextField` with `inputType: 'email'` or `'url'` takes only an email address or an absolute URL, as the browser's inputs do. The kit's form does not let the browser validate (`noValidate`), so until now such a field took any text unless it had a `pattern`. A field with a `pattern` of its own keeps it: the pattern decides, with its message. The messages are `email` and `url`, replaceable with `setMessages` or a field's `messages`.
