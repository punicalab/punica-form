// schema.json: the JSON Schema of a form definition, for tools that take a
// schema as a file (structured output of a model, an editor).
import { writeFileSync } from 'node:fs';
import { formDefinitionSchema } from './dist/definition/index.mjs';

writeFileSync(
  'schema.json',
  JSON.stringify(formDefinitionSchema, null, 2) + '\n'
);
