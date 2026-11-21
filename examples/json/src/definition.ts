import type { FormDefinition } from '@punica/form-json';

/** What a model could answer to "ask the user how to reach them". */
export const definition: FormDefinition = {
  version: 1,
  title: 'How can we reach you?',
  items: [
    {
      property: 'email',
      type: 'text',
      label: 'Email',
      rules: [{ rule: 'required' }, { rule: 'email' }],
      props: { inputType: 'email' }
    },
    { property: 'call', type: 'checkbox', label: 'Call me back', value: false },
    {
      property: 'phone',
      type: 'text',
      label: 'Phone number',
      visibleWhen: { property: 'call', equals: true },
      rules: [
        { rule: 'required' },
        {
          rule: 'pattern',
          value: '^\\+?[0-9 ]{7,}$',
          message: 'Enter a phone number'
        }
      ]
    },
    {
      property: 'time',
      type: 'select',
      label: 'Best time',
      options: ['Morning', 'Afternoon'],
      value: 'Morning',
      disabledWhen: { property: 'call', notEquals: true }
    }
  ]
};
