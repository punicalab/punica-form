---
'@punica/form': minor
'@punica/form-service': minor
---

Forms without decorator syntax.

- New `defineForm(fields, ...classDecorators)` and `field(value, ...propertyDecorators)` define a form class in projects whose build does not compile decorators. Every existing decorator (`Services`, the field decorators of the kit, your own) is used as a function call; the class takes initial values in its constructor and its instance type follows from the fields.
- `FormController.fromEntity` warns when a class has no form items, the usual sign of a build that does not apply decorators.
