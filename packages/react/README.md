# @punica/form-react

React hooks for [Punica Form](https://form.punicalab.com).

```bash
npm install @punica/form @punica/form-service @punica/form-react
```

```tsx
import { useForm, useFormController } from '@punica/form-react';
import { SetValue, Validate } from '@punica/form-service';
import { UserForm } from './UserForm';

export function UserFormPage() {
  const { controller, error } = useFormController(() => new UserForm());

  if (error) return <p>The form could not be started.</p>;
  if (!controller) return <p>Loading…</p>;

  return <UserFormView controller={controller} />;
}

function UserFormView({ controller }) {
  // Renders again after every change: the form is immutable
  const form = useForm(controller);

  return (
    <form onSubmit={() => controller.getService(Validate).run()}>
      {form.items.map((item) => (
        <input
          key={String(item.property)}
          value={item.value ?? ''}
          onChange={(e) =>
            controller.getService(SetValue).run(item.property, e.target.value)
          }
        />
      ))}
    </form>
  );
}
```

## Hooks

| Hook                                        | What it does                                                                                                                                                 |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `useFormController(createEntity, options?)` | Creates the controller when the component mounts, starts it and returns `{ controller, error }`. `controller` is `undefined` while the form is being started |
| `useForm(controller)`                       | The current form; the component renders again after every change                                                                                             |

`useFormState(controller)` returns `{ dirty, touched, valid, submitting, submitCount, errors }`
of the form. Unlike `useForm`, the component only renders again when that
state changes, which suits a submit button or a "you have unsaved changes"
notice:

```tsx
const { dirty, submitting } = useFormState(controller);

<button disabled={!dirty || submitting}>Save</button>;
```

Services are read from the controller as usual: `controller.getService(Validate)`.
