import { CommandService } from '@punica/form';
import { mockCommandService } from '../__mocks__/commandServiceForClearError';
import { ClearError } from '..';

describe('service clear error', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   *
   */
  test('when the CleanError service executed, the form item error must be deleted', async () => {
    // Create ClearError service
    const clearError = new ClearError();

    // Initialize the service with the mocked CommandService
    clearError.initialize(mockCommandService as CommandService<any, any>);

    await clearError.run('name' as never);

    // Test the run method
    expect(mockCommandService.formData.items[0].error).toEqual(false);
  });

  /**
   *
   */
  test('when the CleanError service executed, the form item error message must be deleted', async () => {
    // Create ClearError service
    const clearError = new ClearError();

    // Initialize the service with the mocked CommandService
    clearError.initialize(mockCommandService as CommandService<any, any>);

    await clearError.run('name' as never);

    // Test the run method
    expect(mockCommandService.formData.items[0].error).toEqual(false);
  });
});
