import { expect, test, type Page } from '@playwright/test';

let errors: string[] = [];

/** The native control inside the n-th field; Playwright looks through shadow roots. */
const control = (page: Page, index: number, selector: string) =>
  page.locator('punica-field').nth(index).locator(selector);

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Create User' })
  ).toBeVisible();
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('the form is rendered with the components, one field per property', async ({
  page
}) => {
  await expect(page.locator('punica-field')).toHaveCount(6);
  await expect(
    page.getByText('Everything on this page comes from the class below.')
  ).toBeVisible();
  await expect(page.getByText('You must be an adult')).toBeVisible();
  await expect(control(page, 0, 'input')).toBeVisible();
  await expect(control(page, 4, 'textarea')).toBeVisible();
});

test('rules are validated on blur and on submit; a valid form is submitted', async ({
  page
}) => {
  await control(page, 0, 'input').focus();
  await control(page, 1, 'input').focus();
  await expect(page.getByText('Name is required')).toBeVisible();

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('Email is required')).toBeVisible();
  await expect(page.getByText('I accept the terms is required')).toBeVisible();
  await expect(page.getByTestId('values')).toHaveCount(0);

  await control(page, 0, 'input').pressSequentially('J');
  await control(page, 1, 'input').pressSequentially('nope');
  await control(page, 2, 'input').fill('17');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(
    page.getByText('Name must be at least 2 characters')
  ).toBeVisible();
  await expect(page.getByText('Enter a valid email address')).toBeVisible();
  await expect(page.getByText('Age must be at least 18')).toBeVisible();

  await control(page, 0, 'input').fill('Jane');
  await control(page, 1, 'input').fill('jane@example.com');
  await control(page, 2, 'input').fill('30');
  await page.locator('punica-select').click();
  await page.locator('punica-option', { hasText: 'Türkiye' }).click();
  await control(page, 4, 'textarea').fill('Hello');
  await page.locator('punica-checkbox').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByTestId('values')).toHaveText(
    '{"name":"Jane","email":"jane@example.com","age":30,"country":"Türkiye","about":"Hello","terms":true}'
  );
  await expect(page.getByText('is required')).toHaveCount(0);
});

test('reset restores the form', async ({ page }) => {
  await control(page, 0, 'input').fill('Jane');
  await page.locator('punica-checkbox').click();
  await page.getByRole('button', { name: 'Reset' }).click();

  await expect(control(page, 0, 'input')).toHaveValue('');
  await expect(page.locator('punica-checkbox input')).not.toBeChecked();
});

test('what the submit handler throws is shown as an error of the form', async ({
  page
}) => {
  await control(page, 0, 'input').fill('Taken');
  await control(page, 1, 'input').fill('jane@example.com');
  await control(page, 2, 'input').fill('30');
  await page.locator('punica-checkbox').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByRole('alert')).toHaveText('That name is taken');
  await expect(page.getByTestId('values')).toHaveCount(0);

  await control(page, 0, 'input').fill('Jane');
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByTestId('values')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test.describe('the other kinds of fields', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/?form=order');
    await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible();
  });

  test('choices that are loaded, dates, files and several choices', async ({
    page
  }) => {
    const city = page.locator('punica-select').nth(0);
    const extras = page.locator('punica-select').nth(1);
    const day = page.locator('punica-date-picker').locator('input');

    // The cities arrive a moment later
    await expect(city).toHaveJSProperty('disabled', true);
    await expect(city.locator('punica-option')).toHaveCount(3);
    await expect(city).toHaveJSProperty('disabled', false);

    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.getByText('Delivery is required')).toBeVisible();
    await expect(page.getByText('City is required')).toBeVisible();
    await expect(page.getByText('Lines needs at least 1')).toBeVisible();

    await page.locator('punica-radio', { hasText: 'Pick up' }).click();
    await city.click();
    await city.locator('punica-option', { hasText: 'Sfax' }).click();

    // A text that is no date is not an empty field
    await day.fill('soon');
    // Past the button of the calendar, out of the field
    await day.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.getByText('Day is not a date')).toBeVisible();

    // Outside the days the form takes
    await day.fill('01/25/2026');
    await day.press('Tab');
    await expect(
      page.getByText('Day must be 2026-01-20 or earlier')
    ).toBeVisible();
    await day.fill('01/12/2026');
    await day.press('Tab');
    await expect(page.getByText('Day must be')).toHaveCount(0);

    await extras.click();
    for (const extra of ['Wrap', 'Card', 'Bag']) {
      await extras.locator('punica-option', { hasText: extra }).click();
    }
    await page.keyboard.press('Escape');
    await page.locator('punica-input[type="password"] input').fill('SAVE10');
    await expect(page.getByText('Extras takes at most 2')).toBeVisible();
    await extras.click();
    await extras.locator('punica-option', { hasText: 'Card' }).click();
    await page.keyboard.press('Escape');

    const receipt = page.locator('punica-file-input input[type="file"]');

    // The dialog of the browser lets any file through
    await receipt.setInputFiles({
      name: 'photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('x')
    });
    await expect(
      page.getByText('Receipt does not take this kind of file')
    ).toBeVisible();
    await receipt.setInputFiles({
      name: 'large.txt',
      mimeType: 'text/plain',
      buffer: Buffer.alloc(4096)
    });
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(
      page.getByText('Receipt must not be larger than 1 KB')
    ).toBeVisible();
    await receipt.setInputFiles({
      name: 'receipt.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('paid')
    });

    await page.locator('punica-button', { hasText: 'Add line' }).click();
    await page.locator('[data-kit-row] input').first().fill('Paper');
    await page.getByRole('button', { name: 'Save' }).click();

    await expect(page.getByTestId('values')).toHaveText(
      '{"delivery":"pickup","city":"Sfax","day":"2026-01-12","extras":["Wrap","Bag"],"coupon":"SAVE10","receipt":"file:receipt.txt","lines":[{"product":"Paper","quantity":1}]}'
    );
  });

  test('a list of rows: each row is validated on its own', async ({ page }) => {
    const rows = page.locator('[data-kit-row]');
    const add = page.locator('punica-button', { hasText: 'Add line' });

    await add.click();
    await add.click();
    await expect(rows).toHaveCount(2);

    // Leaving the product of the first row validates that row only
    await rows.nth(0).locator('input').first().focus();
    await rows.nth(1).locator('input').first().focus();
    await expect(rows.nth(0).getByText('Product is required')).toBeVisible();
    await expect(rows.nth(1).getByText('Product is required')).toHaveCount(0);

    await rows.nth(1).locator('input').first().fill('Ink');
    await rows.nth(0).locator('punica-button', { hasText: 'Remove' }).click();
    await expect(rows).toHaveCount(1);
    await expect(rows.nth(0).locator('input').first()).toHaveValue('Ink');

    await page.getByRole('button', { name: 'Reset' }).click();
    await expect(rows).toHaveCount(0);
  });
});
