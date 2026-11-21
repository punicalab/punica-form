import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@punica/components/tokens.css';
import { FormDefinitionError } from '@punica/form-json';
import { JsonForm } from '@punica/form-kit/json';
import { definition } from './definition';

/** The JSON as an object, or what is wrong with its syntax. */
const parse = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch (error) {
    return String(error);
  }
};

function Problems({ error }: { error: unknown }) {
  const problems =
    error instanceof FormDefinitionError
      ? error.problems.map(({ path, message }) => `${path} ${message}`)
      : [String(error)];

  return (
    <ul role="alert">
      {problems.map((problem) => (
        <li key={problem}>{problem}</li>
      ))}
    </ul>
  );
}

function App() {
  const [text, setText] = useState(JSON.stringify(definition, null, 2));
  const [values, setValues] = useState<unknown>(null);

  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 24,
        padding: 24,
        fontFamily: 'system-ui'
      }}
    >
      <textarea
        aria-label="Form definition"
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          setValues(null);
        }}
        rows={40}
        style={{ fontFamily: 'monospace' }}
      />

      <div>
        {/* A new definition is a new form */}
        <JsonForm
          key={text}
          definition={parse(text)}
          onSubmit={setValues}
          submitLabel="Send"
          failed={(error) => <Problems error={error} />}
        />

        {values ? (
          <pre data-testid="values">{JSON.stringify(values)}</pre>
        ) : null}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
