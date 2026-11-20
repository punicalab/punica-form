import { expect, test } from '@playwright/test';

test('a form defined without decorators is rendered, validated and submitted', async ({
  page
}) => {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'Create User' })
  ).toBeVisible();
  await expect(page.locator('punica-field')).toHaveCount(3);

  // The value the form was created with
  const name = page.locator('punica-field').nth(0).locator('input');

  await expect(name).toHaveValue('Jane');

  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText('I accept the terms is required')).toBeVisible();

  await page.locator('punica-field').nth(1).locator('input').fill('30');
  await page.locator('punica-checkbox').click();
  await page.getByRole('button', { name: 'Save' }).click();

  await expect(page.getByTestId('values')).toHaveText(
    '{"name":"Jane","age":30,"terms":true}'
  );
  expect(errors).toEqual([]);
});
