import { useState, type FormEvent } from 'react';
import { defaultFormItemRegister, type FormController } from '@punica/form';
import { useForm, useFormController } from '@punica/form-react';
import {
  GetValues,
  Reset,
  SetValue,
  Trigger,
  Validate
} from '@punica/form-service';
import type { AppItem } from './formSystem';
import { InvoicePanel } from './Invoice';
import { UserForm } from './UserForm';

type Controller = FormController<UserForm, AppItem<UserForm>>;

function UserFormView({ controller }: { controller: Controller }) {
  const form = useForm(controller);
  const [values, setValues] = useState<UserForm | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const isValid = await controller.getService(Validate).run();

    setValues(isValid ? await controller.getService(GetValues).run() : null);
  };

  const handleReset = async () => {
    await controller.getService(Reset).run();
    setValues(null);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      <h2>{String(form.title)}</h2>
      {form.items
        .filter((item) => !item.hidden)
        .map((item) => {
          const Renderer = defaultFormItemRegister.getItem(item.type ?? '');

          return (
            Renderer && (
              <Renderer
                key={item.property}
                item={item}
                onChange={(value: string) =>
                  controller.getService(SetValue).run(item.property, value)
                }
                onBlur={() => controller.getService(Trigger).run(item.property)}
              />
            )
          );
        })}
      <button type="submit">Submit</button>{' '}
      <button type="button" onClick={handleReset}>
        Reset
      </button>
      {values && <pre data-testid="values">{JSON.stringify(values)}</pre>}
    </form>
  );
}

function UserFormPanel({ name }: { name: string }) {
  const { controller, error } = useFormController<UserForm, AppItem<UserForm>>(
    () => new UserForm(),
    { name }
  );

  return (
    <section data-testid={name} style={{ flex: 1 }}>
      {error ? (
        <p>The form could not be started.</p>
      ) : controller ? (
        <UserFormView controller={controller} />
      ) : (
        <p>Loading…</p>
      )}
    </section>
  );
}

/** Two forms of the same class, side by side: each has its own state and services. */
export function App() {
  return (
    <main style={{ fontFamily: 'system-ui', padding: 24 }}>
      <div style={{ display: 'flex', gap: 48 }}>
        <UserFormPanel name="first" />
        <UserFormPanel name="second" />
      </div>
      <InvoicePanel />
    </main>
  );
}
