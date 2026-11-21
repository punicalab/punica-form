import { ErrorDetail } from '@punica/form';
import { validate } from './issues';
import { StandardSchema } from './standard';

/**
 * The validation of a form item from a schema of its value:
 *
 * @TextField({ label: 'Email', validation: schema(z.string().email()) })
 * email = '';
 *
 * The messages of the item are the messages of the issues of the schema.
 * @param standard - A schema of Zod, Valibot, ArkType or another library
 * that implements Standard Schema
 */
export const schema = (standard: StandardSchema) => {
  return async ({
    formItem
  }: {
    formItem: { value?: unknown };
  }): Promise<ErrorDetail> => {
    const messages = (await validate(standard, formItem.value)).map(
      ({ message }) => message
    );

    return { error: messages.length > 0, errorMessages: messages };
  };
};
