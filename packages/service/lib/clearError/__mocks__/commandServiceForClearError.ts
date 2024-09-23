import { FormItem } from '@punica/form';

export const mockCommandService = {
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
  //@ts-ignore
  fireEvent: (eventName: string, data: any) => {},
  getItem: (property: any) =>
    mockCommandService.form.items.find(
      (item) => item.property === property
    ) as FormItem<any>
};
