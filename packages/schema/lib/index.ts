import type { FormItem } from '@punica/form';
import type { SchemaValidation } from './service';

export { Schema } from './decorator';
export { schema } from './schema';
export { SchemaValidation } from './service';
export type { StandardIssue, StandardResult, StandardSchema } from './standard';

declare module '@punica/form' {
  interface ServiceRegistry<E, F extends FormItem<E>> {
    schemaValidation: SchemaValidation<E, F>;
  }
}
