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
- `@punica/form-json`: forms as data; see "Forms as data" below.
- `@punica/form-schema`: validation with a schema of Zod, Valibot, ArkType
  or Yup; see "Validation with a schema" below.
- `@punica/form-service`: `Validate`, `GetValues`, `SetValue`, `Reset`,
  `ResetItem`, `Trigger`, `ClearError`, `ClearErrors`, `Touch`, `Submit`,
  `FieldArray`, `Store`.
- NOT provided: `@Title`, `@Description`, `@Layout`, `@FormItemInputText` or
  any other form item decorator, a `Reader` class, a base form item. These
  belong to the application's own form system. Build them with the `define*`
  helpers and by implementing `IReader`; import them from the application's
  own module, never from `@punica/form`.
- Decorators work with both the legacy implementation of TypeScript
  (`"experimentalDecorators": true`) and the standard one. There is no
  `reflect-metadata`: never call `Reflect.getMetadata`.
- Before writing a decorated class, check that the build compiles decorator
  syntax: `"experimentalDecorators": true` in `tsconfig.json` is enough for
  Vite and esbuild. When it does not and you should not change it, define the
  form with `defineForm` (since 2.2), which needs no decorator syntax. Every
  decorator (`Services`, the kit's `TextField`, your own) is then a function
  call:

  ```ts
  import { defineForm, field, Services } from "@punica/form";

  const UserForm = defineForm(
    {
      name: field("", Text({ label: "Name" })),
      age: field<number | undefined>(undefined, NumberInput({ label: "Age" })),
    },
    Services([GetValues, SetValue]) // or FormKit({ title: "User" })
  );
  type User = InstanceType<typeof UserForm>;

  const controller = await FormController.fromEntity(new UserForm({ name: "Jane" }));
  ```

  The result is a form class like a decorated one; do not mix both styles in
  one class. `fromEntity` warns when a class ends up without form items.

## The ready-made form system

`@punica/form-kit` provides what the application would otherwise build:
`@FormKit({ title, columns })` on the class, the field decorators `TextField`,
`NumberField`, `TextAreaField`, `SelectField`, `CheckboxField` and
`SwitchField` with the rules `required`, `minLength`, `maxLength`, `pattern`,
`min` and `max`, and from `@punica/form-kit/react` the component
`<KitForm entity={() => new UserForm()} onSubmit={…} />`, which renders the
form with `@punica/components`, shows what `onSubmit` throws above the
fields and reports it to `onError`. Use it when the project has it installed;
otherwise build the form system as described below.

## Forms as data, written at run time

Everything above is for code. When the form itself has to be produced at run
time (an agent asking the user for information, a form sent by a server),
write a form definition instead: JSON, no code. `@punica/form-json` checks
and runs it.

- Read `get_form_schema` for the format and check every definition with
  `validate_form` before handing it over.
- Render it with `<JsonForm definition={definition} onSubmit={…} />` from
  `@punica/form-kit/json`, or create the controller with
  `fromSchema(definition, { types, rules })` from `@punica/form-json`. Both
  refuse a definition that is not valid with a `FormDefinitionError` whose
  `problems` have a `path` and a `message`.
- Types with the kit: `text`, `textarea`, `number`, `select`, `checkbox`,
  `switch`. Kit options such as `inputType`, `rows` and `span` go into `props`.
- Never put functions, expressions or HTML into a definition, and never
  build one by string concatenation: produce the object and validate it.
- In React a definition is read when the component mounts; give `JsonForm` a
  `key` to show another one.
- `fromJsonSchema(schema)` turns a flat JSON Schema (string, number, integer,
  boolean and enum properties) into a definition.

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

In React use `@punica/form-react`:

```tsx
const { controller, error } = useFormController(() => new UserForm());
// controller is undefined while the form is being started
const form = useForm(controller); // in a component that has the controller
```

Without that package: `useSyncExternalStore(controller.subscribe, controller.getForm)`.
`start()` publishes the started form the same way (since 2.1).

Since 2.2 every item has `dirty` (its value differs from the initial one) and
`touched` (set by the `Touch` service), and a started form has
`form.state`: `{ dirty, touched, valid, validating, submitting, submitCount, errors }`.
`dirty`, `touched` and `valid` follow from the items; `errors` are the errors
of the form as a whole, such as a rejected submit. In React
`useFormState(controller)` returns it and only renders again when it changes.
Never change a form or an item in place; use the services.

## Services

Services are read by class and executed with `run`. They are bound to the
entity of the form, so property names and results are type-checked.

| Class | Call |
|---|---|
| `Validate` | `run(): Promise<boolean>`, validates every item that is not hidden or disabled |
| `Trigger` | `run(property): Promise<void>`, validates one item |
| `GetValues` | `run(): Promise<E>`, a copy of the entity filled with the item values |
| `SetValue` | `run(property, value): Promise<void>`, then runs the `control` function of the item |
| `Reset` | `run(): Promise<void>` |
| `ResetItem` | `run(property): Promise<void>` |
| `ClearError` | `run(property): Promise<void>` |
| `ClearErrors` | `run(): Promise<void>` |
| `Touch` | `run(property): Promise<void>`, marks the item as touched; call it when the user leaves the field (since 2.2) |
| `Submit` | `run(handler?): Promise<boolean>`, validates, then calls `handler(values)`; sets `state.submitting`, ignores a second submit meanwhile, and turns what the handler throws into `state.errors` instead of rejecting (since 2.2) |
| `FieldArray` | no `run`: `rows(property)`, `append`, `insert`, `remove`, `move`, `replace`; see "Lists of rows" (since 2.2) |
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
- To submit a form prefer `Submit` (since 2.2) over calling `Validate` and
  `GetValues` by hand. Do not keep your own `submitting` or `dirty` flags.

## Lists of rows

For repeated rows (the lines of an invoice, a list of phone numbers) do not
keep an array in a single item and do not build property names such as
`lines.0.price`. Since 2.2 a form item with a `row` function is a list: every
row is a form of its own, created from the entity `row` returns.

```ts
class LineForm {
  @FormItemInputText({ label: 'Product' })
  product = '';
}

@Services([FieldArray, GetValues, SetValue, Validate, Trigger, Submit])
class InvoiceForm {
  // Any form item decorator of the application; `row` makes it a list
  @FormItemList({ label: 'Lines', row: () => new LineForm() })
  lines: LineForm[] = [];
}

const list = controller.getService(FieldArray);

const row = await list.append('lines', { product: 'Paper' });
await row.controller.getService(SetValue).run('product', 'Ink');
await list.remove('lines', row); // or an index
list.rows('lines'); // [{ key, controller }], a new array only when rows change
```

- The form has to list `FieldArray`. A row class without `@Services` gets the
  services of the form around it; one with `@Services` keeps its own.
- The value of the list item is the array of the values of its rows.
  `GetValues` and `Submit` return it; never collect the rows by hand.
- `Validate` and `Submit` validate the rows. The list item is `dirty`,
  `touched` and in `error` when a row is, and `Reset` brings back the rows the
  form was started with. `SetValue` on the list replaces its rows.
- A `validation` of the list item itself counts besides the rows, for
  example "add at least one line".
- In React: `const { rows, append, remove, move } = useFieldArray(controller, "lines")`
  from `@punica/form-react`. Render `rows.map((row) => <Line key={row.key} controller={row.controller} />)`
  and call `useForm(row.controller)` inside `Line`, so typing into a row
  renders that row only.

## Form items

A form item is a plain object: `property`, `label`, `type`, `value`,
`required`, `disabled`, `hidden`, `error`, `errorMessages`, `dirty`,
`touched`, `validating`, and `row` for a list of rows. Add the
properties of your form system with a type of your own:
`type AppItem<E> = FormItem<E> & { layout?: Layout }`, then use
`FormController<UserForm, AppItem<UserForm>>`.

The functions of an item receive a command `{ formItem, initialEntity,
getItem }` holding copies, and return items instead of changing them:

- `validation(command, context?): Promise<{ error: boolean, errorMessages?: string[] }>`.
  Since 2.2 the services pass `context.signal`, an `AbortSignal` that is
  aborted when the item is validated again, changed or reset: give it to
  `fetch(url, { signal: context?.signal })`. A validation that rejects after
  it was aborted is ignored. The item is `validating` meanwhile.
- `validateDebounce: 300` on an item makes `Trigger` wait that many
  milliseconds and validate once after the last trigger (since 2.2). Use it
  for validations that ask a server while the user types; do not write your
  own debounce around `Trigger`. `Validate` and `Submit` do not wait.
- `control(command): Promise<FormItem[]>`, run after its value is set; the
  returned items are written to the form
- `initialize(command): Promise<FormItem[]>`, run once while the form is created

## Validation with a schema

When the project has a schema library (Zod, Valibot, ArkType, Yup: anything
that implements Standard Schema) and `@punica/form-schema`, do not write the
same rules again as validation functions.

```ts
import { Schema, SchemaValidation, schema } from "@punica/form-schema";

const User = z.object({ email: z.email(), age: z.number().min(18) });

@Schema(User) // the class does not compile when its properties do not fit
@Services([SchemaValidation, GetValues, SetValue, Validate, Trigger, Submit])
class UserForm { … }

// Or one item only, without the service:
// validation: schema(z.email("Enter an email"))
```

- `SchemaValidation` has to be listed. It shows every issue on the item its
  path is about; issues that belong to no item become `state.errors`, make
  `state.valid` false and keep the form from being submitted.
- For a form without a class: `services: [SchemaValidation.of(User), …]`.
- A rule about the form as a whole without a schema: a service that calls
  `addFormValidation(command, () => messages)` of `@punica/form-service` in
  its `initialize` (since 2.2).

## Events

`controller.on(event, handler)` returns the function that removes the
handler. Payloads are typed.

| Event | Payload |
|---|---|
| `UPDATE_FORM` | the form; fired after every change |
| `UPDATE_ITEM` | an array: the changed item, then the items its `control` returned |
| `RESET` | the form; fired by `Reset`, after `UPDATE_FORM` |
| `SUBMIT` | the values the submit handler received; fired by `Submit` (since 2.2) |
| `SUBMIT_ERROR` | what a validation or the submit handler threw (since 2.2) |
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
