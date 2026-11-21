import { defineForm, field } from '@punica/form';
import {
  CheckboxField,
  FormKit,
  NumberField,
  TextField
} from '@punica/form-kit';

// No decorator syntax: the same decorators, called as functions
export const UserForm = defineForm(
  {
    name: field('', TextField({ label: 'Name', required: true, minLength: 2 })),
    age: field<number | undefined>(
      undefined,
      NumberField({ label: 'Age', min: 18 })
    ),
    terms: field(
      false,
      CheckboxField({ label: 'I accept the terms', required: true })
    )
  },
  FormKit({ title: 'Create User' })
);

export type User = InstanceType<typeof UserForm>;
