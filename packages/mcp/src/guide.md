# Punica Form: the rules

Punica Form is a headless form engine. `@punica/form` holds the engine,
`@punica/form-service` the built-in services. There are no UI components.

## What the packages provide, and what they do not

- `@punica/form`: `FormController`, the class decorators `@Services`,
  `@Readers` and `@Starters`, the helpers `defineFormItem`,
  `defineFormItemProperty` and `defineFormProperty`, `FormItemRegister`,
  `deepCopy`, the DevTools switches and the types. Use `search_api` for the
  exact list.
- `@punica/form-service`: `Validate`, `GetValues`, `SetValue`, `Reset`,
  `ResetItem`, `Trigger`, `ClearError`, `ClearErrors`, `Store`.
- NOT provided: `@Title`, `@Description`, `@Layout`, `@FormItemInputText` or
  any other form item decorator, a `Reader` class, a `BaseReader`, a
  `BaseFormItem`. These belong to the application's own form system. Build
  them with the `define*` helpers and by implementing `IReader`; import them
  from the application's own module, never from `@punica/form`.
- TypeScript needs `"experimentalDecorators": true`. `reflect-metadata` is
  installed with the library and provides the global `Reflect.getMetadata`.

## Lifecycle

```ts
const controller = await FormController.fromEntity(new UserForm());
const form = await controller.start();
```

`fromEntity` creates the form items from the decorated properties of the
entity (only properties with an initializer, such as `name = ""`).
`start()` then fires `REGISTER_ITEMS`, runs the readers of `@Readers` in
order, runs the starters of `@Starters` (each returns the form, possibly a
new one), initializes the services of `@Services` and returns the form.
Both calls are asynchronous and reject when a reader, starter or service
throws.

## Services

Services are fetched by name. Names are camelCase strings and every service
is executed with `run`:

| Class | Name | Call |
|---|---|---|
| `Validate` | `'validate'` | `run(): Promise<boolean>`, validates every visible item |
| `GetValues` | `'getValues'` | `run(): Promise<E>`, the entity filled with the item values |
| `Reset` | `'reset'` | `run(): Promise<void>` |
| `ResetItem` | `'resetItem'` | `run(property): Promise<void>` |
| `Trigger` | `'trigger'` | `run(property): Promise<void>`, validates one item |
| `ClearError` | `'clearError'` | `run(property): Promise<void>` |
| `ClearErrors` | `'clearErrors'` | `run(): Promise<boolean>` |
| `SetValue` | `'setValue'` | no `run`: it adds `setValue(property, value)` to every form item |
| `Store` | `'store'` | no `run`: it adds `readStoreItem`, `writeStoreItem`, `deleteStoreItem` to the command passed to item functions |

```ts
const isValid = await controller.getServices('validate').run();
const values = await controller.getServices('getValues').run();
await controller.getServices('trigger').run('name');
await item.setValue(item.property, value);
```

- A service works only when it is listed in `@Services([...])`;
  `getServices` returns `undefined` for a name that is not registered.
- There is no `validate(form)`, `getValues(form)`, `setValue(form, …)`,
  `reset(form)` or `validateItem(…)`.
- `Validate.run()` returns `false` when the form is invalid. Other failures
  (an unknown property, an error thrown by a validation function) reject.
- Setting a value does not validate it. Call `trigger` for that.

## Form items

A form item is a plain object: `property`, `label`, `type`, `value`,
`required`, `disabled`, `hidden`, `error`, `errorMessages`, plus anything the
application adds. Its functions receive a command `{ formItem, initialEntity,
getItem }`:

- `validation(command): Promise<{ error: boolean, errorMessages?: string[] }>`
- `control(command): Promise<FormItem[]>`, run after its value is set; the
  returned items are written back to the form
- `initialize(command): Promise<FormItem[]>`, run once while the form is created

## Events

`controller.on(event, handler)` and `controller.off(event, handler)`. The
handler receives the payload as `unknown`; cast it.

| Event | Payload |
|---|---|
| `UPDATE_FORM` | the form; fired by every service that changes it |
| `UPDATE_ITEM` | an array: the changed item, then the items its `control` returned |
| `RESET` | the form; fired by `Reset`, followed by `UPDATE_FORM` |
| `REGISTER_ITEMS` | `string[]` of registered form item types; fired at the start of `start()` |

Services change the form in place. A UI library that compares references,
such as React, needs a new object: `setForm({ ...form })`.

## A complete example

The application's form system:

```tsx
import { defineFormItem, defineFormProperty, type Form, type FormItem, type IReader } from "@punica/form";

export const Title = defineFormProperty<string>("app:title");

export class Reader<E extends object, F extends FormItem<E>> implements IReader<E, F> {
  public async read(entity: E, form: Form<E, F>): Promise<void> {
    form.title = Reflect.getMetadata("app:title", entity);
  }
}

// The second argument is the renderer; FormItemRegister.getInstance().getItem(item.type) returns it
export const FormItemInputText = defineFormItem<Omit<FormItem<any>, "property">>(
  "app:input-text",
  InputText
);
```

A business form:

```ts
import { Readers, Services, type ErrorDetail } from "@punica/form";
import { GetValues, SetValue, Trigger, Validate } from "@punica/form-service";
import { FormItemInputText, Reader, Title } from "./formSystem";

@Title("Create User")
@Readers([new Reader()])
@Services([new GetValues(), new SetValue(), new Validate(), new Trigger()])
export class UserForm {
  @FormItemInputText({
    label: "Name",
    required: true,
    validation: async ({ formItem }): Promise<ErrorDetail> => ({
      error: !formItem.value,
      errorMessages: formItem.value ? [] : ["Name is required"],
    }),
  })
  name = "";
}
```

Using it:

```ts
const controller = await FormController.fromEntity<UserForm, FormItem<UserForm>>(new UserForm());

controller.on("UPDATE_FORM", (data) => render(data as Form<UserForm, FormItem<UserForm>>));

const form = await controller.start();
const [nameItem] = form.items;

await nameItem.setValue("name", "Jane");
await controller.getServices("trigger").run("name");

if (await controller.getServices("validate").run()) {
  const values = await controller.getServices("getValues").run();
}
```

Documentation: https://form.punicalab.com
