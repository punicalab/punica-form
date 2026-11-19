# Punica Form 2: the rules

Punica Form is a headless form engine. `@punica/form` holds the engine,
`@punica/form-service` the built-in services. There are no UI components.

## What the packages provide, and what they do not

- `@punica/form`: `FormController`, the class decorators `@Services`,
  `@Readers` and `@Starters`, the helpers `defineFormItem`,
  `defineFormItemProperty` and `defineFormProperty`, the metadata readers
  `getFormProperty` and `getFormItemProperties`, the form item register,
  `deepCopy`, the DevTools switches and the types. Use `search_api` for the
  exact list.
- `@punica/form-service`: `Validate`, `GetValues`, `SetValue`, `Reset`,
  `ResetItem`, `Trigger`, `ClearError`, `ClearErrors`, `Store`.
- NOT provided: `@Title`, `@Description`, `@Layout`, `@FormItemInputText` or
  any other form item decorator, a `Reader` class, a base form item. These
  belong to the application's own form system. Build them with the `define*`
  helpers and by implementing `IReader`; import them from the application's
  own module, never from `@punica/form`.
- Decorators work with both the legacy implementation of TypeScript
  (`"experimentalDecorators": true`) and the standard one. There is no
  `reflect-metadata`: never call `Reflect.getMetadata`.

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
throws. `FormController.fromForm(form)` starts from a form written as data.

## State

The form is immutable. Every change produces a new form object; items that
did not change keep their identity.

```ts
controller.getForm();                               // the current form
const unsubscribe = controller.subscribe(() => {}); // after every change
```

In React: `useSyncExternalStore(controller.subscribe, controller.getForm)`.
`start()` publishes the started form the same way (since 2.1).
Never change a form or an item in place; use the services.

## Services

Services are read by class and executed with `run`. They are bound to the
entity of the form, so property names and results are type-checked.

| Class | Call |
|---|---|
| `Validate` | `run(): Promise<boolean>`, validates every visible item |
| `Trigger` | `run(property): Promise<void>`, validates one item |
| `GetValues` | `run(): Promise<E>`, a copy of the entity filled with the item values |
| `SetValue` | `run(property, value): Promise<void>`, then runs the `control` function of the item |
| `Reset` | `run(): Promise<void>` |
| `ResetItem` | `run(property): Promise<void>` |
| `ClearError` | `run(property): Promise<void>` |
| `ClearErrors` | `run(): Promise<void>` |
| `Store` | no `run`: it adds `readStoreItem`, `writeStoreItem`, `deleteStoreItem` to the command passed to item functions (`CommandItem<E, F, StoreCommand>`) |

```ts
import { GetValues, SetValue, Trigger, Validate } from "@punica/form-service";

await controller.getService(SetValue).run("name", "Jane");
await controller.getService(Trigger).run("name");

if (await controller.getService(Validate).run()) {
  const values = await controller.getService(GetValues).run();
}
```

- A service works only when it is listed in `@Services([...])`;
  `getService` throws for a class that is not, and before `start()`.
- List service classes (`@Services([GetValues, SetValue])`, since 2.1): every
  form then gets its own services. With 2.0 pass instances
  (`new GetValues()`); instances are shared by all forms of the class.
- `controller.batch(() => { … })` notifies subscribers once for several
  changes (since 2.1).
- There is no `getServices('name')`, no `validate(form)`, no
  `item.setValue(…)` and no `validateItem(…)`.
- `Validate.run()` returns `false` when the form is invalid. Other failures
  (an unknown property, an error thrown by a validation function) reject.
- Setting a value does not validate it. Run `Trigger` for that.

## Form items

A form item is a plain object: `property`, `label`, `type`, `value`,
`required`, `disabled`, `hidden`, `error`, `errorMessages`. Add the
properties of your form system with a type of your own:
`type AppItem<E> = FormItem<E> & { layout?: Layout }`, then use
`FormController<UserForm, AppItem<UserForm>>`.

The functions of an item receive a command `{ formItem, initialEntity,
getItem }` holding copies, and return items instead of changing them:

- `validation(command): Promise<{ error: boolean, errorMessages?: string[] }>`
- `control(command): Promise<FormItem[]>`, run after its value is set; the
  returned items are written to the form
- `initialize(command): Promise<FormItem[]>`, run once while the form is created

## Events

`controller.on(event, handler)` returns the function that removes the
handler. Payloads are typed.

| Event | Payload |
|---|---|
| `UPDATE_FORM` | the form; fired after every change |
| `UPDATE_ITEM` | an array: the changed item, then the items its `control` returned |
| `RESET` | the form; fired by `Reset`, after `UPDATE_FORM` |
| `REGISTER_ITEMS` | `string[]` of registered form item types; fired at the start of `start()` |

## A complete example

The application's form system:

```tsx
import {
  defineFormItem,
  defineFormProperty,
  getFormProperty,
  type Form,
  type FormItem,
  type IReader,
} from "@punica/form";

export const Title = defineFormProperty<string>("app:title");

export class Reader<E extends object, F extends FormItem<E>> implements IReader<E, F> {
  public read(entity: E, form: Form<E, F>): void {
    form.title = getFormProperty<string>(entity, "app:title");
  }
}

// The second argument is the renderer; defaultFormItemRegister.getItem(item.type) returns it
export const FormItemInputText = defineFormItem<Omit<FormItem<any>, "property">>(
  "app:input-text",
  InputText
);
```

A business form:

```ts
import { Readers, Services } from "@punica/form";
import { GetValues, SetValue, Trigger, Validate } from "@punica/form-service";
import { FormItemInputText, Reader, Title } from "./formSystem";

@Title("Create User")
@Readers([new Reader()])
@Services([GetValues, SetValue, Validate, Trigger])
export class UserForm {
  @FormItemInputText({
    label: "Name",
    required: true,
    validation: async ({ formItem }) => ({
      error: !formItem.value,
      errorMessages: formItem.value ? [] : ["Name is required"],
    }),
  })
  name = "";
}
```

Using it:

```ts
const controller = await FormController.fromEntity(new UserForm());

controller.subscribe(() => render(controller.getForm()));
await controller.start();

await controller.getService(SetValue).run("name", "Jane");

if (await controller.getService(Validate).run()) {
  const values = await controller.getService(GetValues).run(); // UserForm
}
```

Documentation: https://form.punicalab.com
