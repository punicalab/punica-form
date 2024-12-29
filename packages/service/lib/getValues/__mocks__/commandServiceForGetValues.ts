export const mockCommandService = {
  initialEntity: {
    name: '',
    email: 'john.doe@example.com',
    age: 42,
    address: {
      street: 'New York City'
    }
  },
  form: {
    items: [
      {
        label: 'Name',
        property: 'name',
        value: 'John Doe'
      },
      {
        label: 'Address',
        property: 'address',
        path: 'address/street',
        value: 'New York'
      },
      {
        label: 'Email',
        property: 'email',
        value: 'john.doe@example.com'
      }
    ]
  }
};
