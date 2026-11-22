---
'@punica/form-service': minor
'@punica/form-kit': minor
'@punica/form-json': minor
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

A name is a property of the form; `lines.1.price` (or `lines[1].price`) is an item of a row of a list, and nested objects and arrays say the same. Such an error goes when its item is validated again, also when the item has no validation of its own, and with `ClearError`, `ClearErrors`, `ResetItem` and `Reset`; a validation that was running when it was set does not erase it. `@FormKit`, `fromSchema` and `JsonForm` list the service, and the MCP server's guide shows how to use it in a submit handler.
