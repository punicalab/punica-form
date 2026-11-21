import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@punica/components/tokens.css';
import { KitForm } from '@punica/form-kit/react';
import { UserForm, type User } from './UserForm';

function App() {
  const [values, setValues] = useState<User | null>(null);

  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: 24 }}>
      <KitForm
        entity={() => new UserForm({ name: 'Jane' })}
        onSubmit={setValues}
        submitLabel="Save"
      />

      {values && <pre data-testid="values">{JSON.stringify(values)}</pre>}
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
