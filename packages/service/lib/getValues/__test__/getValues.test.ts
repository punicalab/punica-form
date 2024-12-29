import { CommandService } from '@punica/form';
import { mockCommandService } from '../__mocks__/commandServiceForGetValues';
import { GetValues } from '..';

describe('service clear error', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   *
   */
  test('when the GetValues service executed, get all values', async () => {
    // Create GetValues service
    const getValues = new GetValues();

    // Initialize the service with the mocked CommandService
    getValues.initialize(mockCommandService as CommandService<any, any>);

    const values = await getValues.run();

    // Test the run method
    expect(values).toEqual({
      name: 'John Doe',
      email: 'john.doe@example.com',
      age: 42,
      address: {
        street: 'New York'
      }
    });
  });

  /**
   *
   */
  test('when the GetValues service executed, get all initial values', async () => {
    // Create GetValues service
    const getValues = new GetValues();

    // Initialize the service with the mocked CommandService
    getValues.initialize(mockCommandService as CommandService<any, any>);

    const values = await getValues.run();

    // Test the run method
    //@ts-ignore
    expect(values?.['age']).toEqual(42);
  });
});
