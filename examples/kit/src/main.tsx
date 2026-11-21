import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@punica/components/tokens.css';
import { KitForm } from '@punica/form-kit/react';
import { OrderForm } from './OrderForm';
import { UserForm } from './UserForm';

/** What a form was submitted with; a file is shown by its name. */
const show = (values: object) =>
  JSON.stringify(values, (_key, value) =>
    value instanceof File ? `file:${value.name}` : value
  );

function App() {
  const [values, setValues] = useState<object | null>(null);
  // `?form=order` shows the form with the other kinds of fields
  const order = new URLSearchParams(location.search).get('form') === 'order';

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'system-ui'
      }}
    >
      {order ? (
        <KitForm
          entity={() => new OrderForm()}
          onSubmit={setValues}
          submitLabel="Save"
          resetLabel="Reset"
        />
      ) : (
        <KitForm
          entity={() => new UserForm()}
          onSubmit={(user) => {
            // Stands in for a request the server rejects
            if (user.name === 'Taken') {
              throw new Error('That name is taken');
            }

            setValues(user);
          }}
          onError={() => undefined}
          submitLabel="Save"
          resetLabel="Reset"
        />
      )}

      {values && <pre data-testid="values">{show(values)}</pre>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
