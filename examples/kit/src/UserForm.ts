import {
  CheckboxField,
  FormKit,
  NumberField,
  SelectField,
  TextAreaField,
  TextField
} from '@punica/form-kit';

@FormKit({
  title: 'Create User',
  description: 'Everything on this page comes from the class below.',
  columns: 2
})
export class UserForm {
  @TextField({ label: 'Name', required: true, minLength: 2 })
  name = '';

  @TextField({
    label: 'Email',
    inputType: 'email',
    required: true,
    pattern: /^\S+@\S+\.\S+$/,
    messages: { pattern: () => 'Enter a valid email address' }
  })
  email = '';

  @NumberField({ label: 'Age', min: 18, help: 'You must be an adult' })
  age?: number;

  @SelectField({ label: 'Country', options: ['Tunisia', 'Türkiye'] })
  country = '';

  @TextAreaField({ label: 'About', rows: 3, span: 'full' })
  about = '';

  @CheckboxField({ label: 'I accept the terms', required: true, span: 'full' })
  terms = false;
}
