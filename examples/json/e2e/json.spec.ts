import { expect, test, type Page } from '@playwright/test';

let errors: string[] = [];

const field = (page: Page, label: string) =>
  page.locator(`punica-field[label="${label}"]`);

test.beforeEach(async ({ page }) => {
  errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: 'How can we reach you?' })
  ).toBeVisible();
});

test.afterEach(() => {
  expect(errors).toEqual([]);
});

test('a form definition is rendered, with its conditions and rules', async ({
  page
}) => {
  await expect(page.locator('punica-field')).toHaveCount(3);
  await expect(field(page, 'Phone number')).toHaveCount(0);
  await expect(page.locator('punica-select')).toHaveAttribute('disabled');

  await page.getByRole('button', { name: 'Send' }).click();
  await expect(page.getByText('Email is required')).toBeVisible();

  await field(page, 'Email').locator('input').fill('jane@example.com');

  // Leaving the field removes its message, which moves what is below it
  await page.keyboard.press('Tab');
  await expect(page.getByText('Email is required')).toHaveCount(0);
  await page.locator('punica-checkbox').click();

  // Ticking the box shows the phone number and enables the time
  await expect(field(page, 'Phone number')).toBeVisible();
  await expect(page.locator('punica-select')).not.toHaveAttribute('disabled');

  await field(page, 'Phone number').locator('input').fill('abc');
  await page.getByRole('button', { name: 'Send' }).click();
  await expect(
    field(page, 'Phone number').getByText('Enter a phone number')
  ).toBeVisible();

  await field(page, 'Phone number').locator('input').fill('+90 555 000 00');
  await page.getByRole('button', { name: 'Send' }).click();

  await expect(page.getByTestId('values')).toHaveText(
    '{"email":"jane@example.com","call":true,"phone":"+90 555 000 00","time":"Morning"}'
  );
});

test('a definition that is not valid is refused and says why', async ({
  page
}) => {
  await page.getByLabel('Form definition').fill(
    JSON.stringify({
      version: 1,
      items: [
        { property: 'a', type: 'html', label: '<img src=x onerror=alert(1)>' },
        { property: 'b', type: 'text', label: 'B', onChange: 'alert(1)' }
      ]
    })
  );

  await expect(page.getByRole('alert')).toContainText(
    'items[0].type "html" is not a known type'
  );
  await expect(page.getByRole('alert')).toContainText(
    'items[1].onChange is not a known key'
  );
  await expect(page.locator('punica-field')).toHaveCount(0);

  // Text of a definition is shown as text, never as markup
  await page.getByLabel('Form definition').fill(
    JSON.stringify({
      version: 1,
      title: '<img src=x onerror=alert(1)>',
      items: [{ property: 'a', type: 'text', label: '<b>bold</b>' }]
    })
  );

  await expect(
    page.getByRole('heading', { name: '<img src=x onerror=alert(1)>' })
  ).toBeVisible();
  await expect(page.locator('main img')).toHaveCount(0);
});
