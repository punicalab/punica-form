import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@punica/components/tokens.css';
import { KitForm } from '@punica/form-kit/react';
import { UserForm } from './UserForm';

function App() {
  const [values, setValues] = useState<UserForm | null>(null);

  return (
    <main
      style={{
        maxWidth: 720,
        margin: '0 auto',
        padding: 24,
        fontFamily: 'system-ui'
      }}
    >
      <KitForm
        entity={() => new UserForm()}
        onSubmit={setValues}
        submitLabel="Save"
        resetLabel="Reset"
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
