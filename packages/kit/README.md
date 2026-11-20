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

## Fields

| Decorator       | Value                             | Component                                                                     |
| --------------- | --------------------------------- | ----------------------------------------------------------------------------- |
| `TextField`     | `string`                          | `punica-input`; `inputType` picks `email`, `password`, `tel`, `url` or `date` |
| `NumberField`   | `number`, `undefined` while empty | `punica-input` of type `number`                                               |
| `TextAreaField` | `string`                          | `punica-textarea`                                                             |
| `SelectField`   | `string`                          | `punica-select` with `options`                                                |
| `CheckboxField` | `boolean`                         | `punica-checkbox`                                                             |
| `SwitchField`   | `boolean`                         | `punica-switch`                                                               |

Every field takes `label`, `help`, `placeholder`, `disabled`, `hidden`,
`span` (columns it takes) and the functions of a form item (`validation`,
`control`, `initialize`).

## Validation

Rules are validated by the kit: `required`, `minLength`, `maxLength`,
`pattern`, `min`, `max`. A field's own `validation` function runs after them,
for a value that passed. A field is validated when the user leaves it and the
whole form when it is submitted; `onSubmit` is only called for a valid form.

Messages can be replaced for one field with `messages`, or for every form:

```ts
import { setMessages } from '@punica/form-kit';

setMessages({ required: (label) => `${label} zorunludur` });
```

## `@FormKit`

Sets up the form: its title, description and number of columns, the kit's
reader and the services `GetValues`, `SetValue`, `Validate`, `Trigger` and
`Reset`. Add your own with the `services`, `readers` and `starters` options.

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
