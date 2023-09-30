import { CommandService } from '@punica/form';
import { mockCommandService } from '../__mocks__/commandServiceForClearErrors';
import { ClearErrors } from '..';

describe('service clear error', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   *
   */
  test('when the CleanError service executed, the form item errors must be deleted', async () => {
    // Create ClearErrors service
    const clearErrorsService = new ClearErrors();

    // Initialize the service with the mocked CommandService
    clearErrorsService.initialize(
      mockCommandService as CommandService<any, any>
    );

    await clearErrorsService.run();

    expect(
      mockCommandService.formData.items.some((item) => item.error)
    ).toEqual(false);
  });

  /**
   *
   */
  test('when the CleanError service executed, the form item error messages must be deleted', async () => {
    // Create ClearErrors service
    const clearErrorsService = new ClearErrors();

    // Initialize the service with the mocked CommandService
    clearErrorsService.initialize(
      mockCommandService as CommandService<any, any>
    );

    // Test the run method
    await clearErrorsService.run();

    expect(
      mockCommandService.formData.items.some(
        (item) => item.errorMessages != null
      )
    ).toEqual(false);
  });
});
