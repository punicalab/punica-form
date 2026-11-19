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
