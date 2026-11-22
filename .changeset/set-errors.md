---
'@punica/form-service': minor
'@punica/form-kit': minor
'@punica/form-mcp': minor
---

`SetErrors`, a service that shows errors found outside the form on the items they are about: what a server refused with messages by field.

```ts
const rest = await controller.getService(SetErrors).run({
  email: ['This email is already registered'],
  'lines.1.price': ['Too high'],
  capacity: ['Only 10 seats are left']
});
// rest: ['Only 10 seats are left'], the messages that name no item
```

A name is a property of the form; `lines.1.price` (or `lines[1].price`) is an item of a row of a list. Such an error stays until its item is validated again, reset or cleared. The kit lists the service, and the MCP server's guide shows how to use it in a submit handler.
