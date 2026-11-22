# @punica/form-kit

A ready-made form system for [Punica Form](https://form.punicalab.com):
decorators for the common fields, validation rules, and React components
built on [@punica/components](https://components.punicalab.com).

Punica Form is headless: with the core packages you write your own
decorators, reader and components. The kit is that work done once, so a form
is a class and one component.

```bash
npm install @punica/form-kit @punica/form @punica/form-service @punica/form-react @punica/components
```

It needs React 19 or later. The components are custom elements: React 19
passes them objects, such as the files of a file field, as properties and
listens to their events, which earlier versions do not.

```ts
import {
  CheckboxField,
  FormKit,
  SelectField,
  TextField
} from '@punica/form-kit';

@FormKit({ title: 'Create User', columns: 2 })
export class UserForm {
  @TextField({ label: 'Name', required: true, minLength: 2 })
  name = '';

  @TextField({ label: 'Email', inputType: 'email', pattern: /^\S+@\S+\.\S+$/ })
  email = '';

  @SelectField({ label: 'Country', options: ['Tunisia', 'Türkiye'] })
  country = '';

  @CheckboxField({ label: 'I accept the terms', required: true, span: 'full' })
  terms = false;
}
```

```tsx
import '@punica/components/tokens.css';
import { KitForm } from '@punica/form-kit/react';

<KitForm
  entity={() => new UserForm()}
  onSubmit={(values) => save(values)}
  submitLabel="Save"
/>;
```

`onError` receives what a validation, a control function or `onSubmit` threw;
without it the error is logged to the console. What `onSubmit` throws is also
shown above the fields, so `throw new Error('That email is taken')` is enough
to report a failed request. Disabled and hidden fields are
not validated.

It needs React 19 or later: React 18 does not pass properties and custom
events to custom elements.

## Forms from JSON

`@punica/form-kit/json` renders a form that is described as data, such as one
a language model wrote. It needs
[`@punica/form-json`](https://www.npmjs.com/package/@punica/form-json), which
checks the definition before anything is rendered:

```tsx
import { JsonForm } from '@punica/form-kit/json';

<JsonForm definition={definition} onSubmit={(values) => send(values)} />;
```

## Fields

| Decorator          | Value                                 | Component                                                                     |
| ------------------ | ------------------------------------- | ----------------------------------------------------------------------------- |
| `TextField`        | `string`                              | `punica-input`; `inputType` picks `email`, `password`, `tel`, `url` or `date` |
| `NumberField`      | `number`, `undefined` while empty     | `punica-input` of type `number`                                               |
| `TextAreaField`    | `string`                              | `punica-textarea`                                                             |
| `SelectField`      | `string`                              | `punica-select` with `options`                                                |
| `CheckboxField`    | `boolean`                             | `punica-checkbox`                                                             |
| `SwitchField`      | `boolean`                             | `punica-switch`                                                               |
| `RadioGroupField`  | `string`                              | `punica-radio-group` with `options`; `orientation` lays them out              |
| `MultiSelectField` | `string[]`                            | `punica-select` with `multiple` and `options`                                 |
| `DateField`        | `yyyy-mm-dd`, `undefined` while empty | `punica-date-picker`; `locale` picks the language                             |
| `PasswordField`    | `string`                              | `punica-input` of type `password`                                             |
| `FileField`        | `File`, with `multiple` a `File[]`    | `punica-file-input`; `accept` limits the files                                |
| `ArrayField`       | an array of rows                      | a form for every row, with buttons to add and remove; see below               |

Every field takes `label`, `help`, `placeholder`, `disabled`, `hidden`,
`span` (columns it takes) and the functions of a form item (`validation`,
`control`, `initialize`).

### Choices that are loaded

`options` is a list, or a function that loads one. The field shows that it is
loading (`loadingText`), and the function is called once, also when several
forms use it:

```ts
@SelectField({ label: 'City', options: () => api.cities() })
city = '';
```

### Lists of rows

`ArrayField` is a list such as the lines of an invoice. Every row is a form
of the class `row` returns, rendered with the fields of that class:

```ts
class LineForm {
  @TextField({ label: 'Product', required: true })
  product = '';

  @NumberField({ label: 'Quantity', min: 1 })
  quantity?: number = 1;
}

@FormKit({ title: 'Invoice' })
class InvoiceForm {
  @ArrayField({
    label: 'Lines',
    row: () => new LineForm(),
    minItems: 1,
    addLabel: 'Add line'
  })
  lines: LineForm[] = [];
}
```

The row class needs no `@FormKit`; with it, `columns` lays out the fields of
a row. The rows of a disabled list are disabled. Typing into a row renders
that row only, as long as the `components` and `onError` you give the form
are the same between renders.

## Validation

Rules are validated by the kit: `required`, `minLength`, `maxLength` and
`pattern` for text, `min` and `max` for numbers, `minDate` and `maxDate` for
dates, `minItems` and `maxItems` for several choices, files and rows, and
`maxFileSize` (bytes) for files. A file field also checks `accept`, since the
dialog of the browser lets any file through, and a date field reports a
text that is no date. A field's own `validation` function runs
after them, for a value that passed.

What is typed is validated when the user leaves the field, what is chosen
(a select, a radio group, a date, a file, a checkbox) when it is chosen, and
the whole form when it is submitted; `onSubmit` is only called for a valid
form.

Messages can be replaced for one field with `messages`, or for every form:

```ts
import { setMessages } from '@punica/form-kit';

setMessages({ required: (label) => `${label} zorunludur` });
```

## `@FormKit`

Sets up the form: its title, description and number of columns, the kit's
reader and the services `GetValues`, `SetValue`, `Validate`, `Trigger`,
`Reset`, `Touch`, `Submit`, `FieldArray` and `SetErrors`. Add your own with the `services`, `readers` and `starters` options.

## Your own components

`components` adds components for your own form item types, or replaces the
kit's:

```tsx
<KitForm
  entity={() => new UserForm()}
  components={{ 'kit:text': MyTextField }}
/>
```

`FormView` renders a controller you created yourself, and the decorators work
without React: import them from `@punica/form-kit`, the components from
`@punica/form-kit/react`.
