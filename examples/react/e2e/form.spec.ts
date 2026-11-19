import { expect, test, type Locator, type Page } from '@playwright/test';

let errors: string[] = [];

const open = async (
  page: Page
): Promise<{ first: Locator; second: Locator }> => {
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');

  const first = page.getByTestId('first');
  const second = page.getByTestId('second');

  await expect(first.getByRole('heading')).toHaveText('Create User');
  await expect(second.getByRole('heading')).toHaveText('Create User');

  return { first, second };
};

test.beforeEach(() => {
  errors = [];
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('the form is built from the decorated class', async ({ page }) => {
  const { first } = await open(page);

  await expect(first.getByLabel('Name')).toHaveValue('');
  await expect(first.getByLabel('Country')).toBeVisible();
  // Hidden until a country is chosen
  await expect(first.getByLabel('City')).toHaveCount(0);
});

test('typing, validation on blur and on submit', async ({ page }) => {
  const { first } = await open(page);

  await first.getByLabel('Name').focus();
  await first.getByLabel('Country').focus();
  await expect(first.getByText('Name is required')).toBeVisible();

  await first.getByRole('button', { name: 'Submit' }).click();
  await expect(first.getByTestId('values')).toHaveCount(0);

  // Typed key by key: every key is a new immutable form
  await first.getByLabel('Name').pressSequentially('Jane Doe');
  await expect(first.getByLabel('Name')).toHaveValue('Jane Doe');

  await first.getByRole('button', { name: 'Submit' }).click();
  await expect(first.getByText('Name is required')).toHaveCount(0);
  await expect(first.getByTestId('values')).toHaveText(
    '{"name":"Jane Doe","country":"","city":""}'
  );
});

test('a control function changes other items', async ({ page }) => {
  const { first } = await open(page);

  await first.getByLabel('Country').selectOption('Tunisia');
  await expect(first.getByLabel('City').locator('option')).toHaveText([
    'Choose…',
    'Tunis',
    'Sfax'
  ]);

  await first.getByLabel('City').selectOption('Sfax');
  await first.getByLabel('Country').selectOption('Türkiye');

  // The city of the other country is cleared
  await expect(first.getByLabel('City')).toHaveValue('');
  await expect(first.getByLabel('City').locator('option')).toHaveText([
    'Choose…',
    'Ankara',
    'İzmir'
  ]);

  await first.getByLabel('Name').fill('Jane');
  await first.getByRole('button', { name: 'Submit' }).click();
  await expect(first.getByText('City is required')).toBeVisible();
});

test('reset restores the initial form', async ({ page }) => {
  const { first } = await open(page);

  await first.getByLabel('Name').fill('Jane');
  await first.getByLabel('Country').selectOption('Tunisia');
  await first.getByRole('button', { name: 'Reset' }).click();

  await expect(first.getByLabel('Name')).toHaveValue('');
  await expect(first.getByLabel('Country')).toHaveValue('');
  await expect(first.getByLabel('City')).toHaveCount(0);
});

test('two forms of one class do not share state or services', async ({
  page
}) => {
  const { first, second } = await open(page);

  await first.getByLabel('Name').fill('Jane');
  await first.getByLabel('Country').selectOption('Tunisia');

  await expect(second.getByLabel('Name')).toHaveValue('');
  await expect(second.getByLabel('City')).toHaveCount(0);

  await second.getByRole('button', { name: 'Submit' }).click();
  await expect(second.getByText('Name is required')).toBeVisible();
  await expect(first.getByText('Name is required')).toHaveCount(0);
});
