# @punica/form-json

Forms as data for [Punica Form](https://form.punicalab.com): a form
definition in JSON that an application checks and renders at run time. It is
made for forms a language model writes, such as an agent asking the user for
missing information, and for forms that come from a server.

A definition holds no code. Rules and conditions are named and declared, so a
definition from an untrusted source cannot run anything: it is checked, and
refused with a list of problems when something is off.

```bash
npm install @punica/form @punica/form-service @punica/form-json
```

## A form definition

```json
{
  "version": 1,
  "title": "How can we reach you?",
  "items": [
    {
      "property": "email",
      "type": "text",
      "label": "Email",
      "rules": [{ "rule": "required" }, { "rule": "email" }]
    },
    { "property": "call", "type": "checkbox", "label": "Call me back" },
    {
      "property": "phone",
      "type": "text",
      "label": "Phone number",
      "visibleWhen": { "property": "call", "equals": true },
      "rules": [{ "rule": "required" }]
    }
  ]
}
```

| Key of an item                | Meaning                                                      |
| ----------------------------- | ------------------------------------------------------------ |
| `property`, `type`, `label`   | Required. The key of the value, the kind of field, its label |
| `value`                       | The value the form starts with                               |
| `help`, `placeholder`         | Texts of the field                                           |
| `options`                     | Choices: `"a"` or `{ "value": "a", "label": "A" }`           |
| `rules`                       | `{ "rule", "value"?, "message"? }`, checked in their order   |
| `visibleWhen`, `disabledWhen` | Conditions on the values of other items                      |
| `props`                       | What the component of the type takes besides, such as `rows` |
| `disabled`, `hidden`          | Fixed state                                                  |

**Rules:** `required`, `email`, `integer`, `min`, `max`, `minLength`, `maxLength`,
`pattern`; `value` holds the limit. Add your own with the `rules` option.

**Conditions:** `{ "property", "equals" }`, `{ "property", "notEquals" }`,
`{ "property", "in": [...] }`, combined with `{ "all": [...] }` and
`{ "any": [...] }`. There are no expressions.

The JSON Schema of the format is exported as `formDefinitionSchema` and as
the file `@punica/form-json/schema.json`: give it to a model as the schema of
its output.

## Rendering a definition

With [`@punica/form-kit`](https://www.npmjs.com/package/@punica/form-kit),
one component:

```tsx
import { JsonForm } from '@punica/form-kit/json';

<JsonForm
  definition={definition}
  onSubmit={(values) => send(values)}
  failed={(error) => <Problems error={error} />}
/>;
```

With your own form system, create the controller and render it as any other
form. `types` says which types a definition may use and which of your form
item types each one stands for:

```ts
import { fromSchema } from '@punica/form-json';

const controller = await fromSchema(definition, {
  types: { text: 'app:text', choice: 'app:select' },
  rules: {
    unique: async (value) => ((await isFree(value)) ? undefined : 'Taken')
  }
});

await controller.start();
```

`fromSchema` throws a `FormDefinitionError` for a definition that is not
valid; its `problems` say what is wrong and where
(`items[2].rules[0].value must be a number`).

## Checking and converting

`@punica/form-json/definition` is the part that needs nothing else, for a
server or a tool:

```ts
import {
  fromJsonSchema,
  validateDefinition
} from '@punica/form-json/definition';

const problems = validateDefinition(input, { types: ['text', 'checkbox'] });

// A flat JSON Schema, such as an elicitation request of the Model Context Protocol
const definition = fromJsonSchema({
  type: 'object',
  required: ['email'],
  properties: { email: { type: 'string', format: 'email', title: 'Email' } }
});
```

## What a definition cannot do

- Hold functions, expressions, HTML or anything that is not JSON.
- Use a type or a rule the application did not allow.
- Point a condition at an item that does not exist.
- Exceed the limits (200 items, 500 options, 2000 characters of a text).

Texts of a definition are rendered as text.

An item that a condition hides goes back to the value it started with, so
what was typed into it is not submitted. A disabled item keeps its value.

A `pattern` rule is a regular expression that runs in the browser of the
user who fills the form in. It is limited to 500 characters, expressions that
repeat a group that repeats (`(a+)+`) are refused and values longer than 2000
characters are not matched. That check is coarse: for definitions you do not
trust at all, leave `pattern` to your own rules.
