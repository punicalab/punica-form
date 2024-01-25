export const mockCommandService = {
  initialEntity: {
    name: '',
    email: 'john.doe@example.com',
    age: 42
  },
  formData: {
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
  }
};
