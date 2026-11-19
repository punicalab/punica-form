import { CommandService, FormItem } from '@punica/form';

// Only the members used by the service are mocked
const command: Partial<CommandService<any, FormItem<any>>> = {
  form: {
    items: [
      {
        label: 'Name',
        property: 'name',
        value: 'John Doe',
        error: true,
        errorMessages: ['Invalid name']
      },
      {
        label: 'Email',
        property: 'email',
        value: 'john.doe@example.com',
        error: true,
        errorMessages: ['Invalid email']
      }
    ]
  },
  fireEvent: jest.fn(),
  getItem: (property) =>
    command.form.items.find((item) => item.property === property)
};

export const mockCommandService = command as CommandService<any, FormItem<any>>;
