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

test.describe('a list of rows', () => {
  const openInvoice = async (page: Page, query = '') => {
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(String(error)));

    await page.goto(`/${query}`);

    const invoice = page.getByTestId('invoice');

    await expect(invoice.getByRole('heading')).toHaveText('Invoice');

    return { invoice, lines: invoice.getByTestId('line') };
  };

  test('rows are added, moved and removed, and submitted as a list', async ({
    page
  }) => {
    const { invoice, lines } = await openInvoice(page);

    await expect(lines).toHaveCount(1);
    await expect(invoice.getByTestId('status')).toHaveText('unchanged, valid');

    await invoice.getByLabel('Customer').fill('Jane');
    await lines.nth(0).getByLabel('Product').fill('Paper');
    await invoice.getByRole('button', { name: 'Add line' }).click();
    await expect(lines).toHaveCount(2);
    await expect(invoice.getByTestId('status')).toHaveText('changed, valid');

    // The new row is empty: the invoice is not submitted
    await invoice.getByRole('button', { name: 'Submit' }).click();
    await expect(lines.nth(1).getByText('Product is required')).toBeVisible();
    await expect(lines.nth(0).getByText('Product is required')).toHaveCount(0);
    await expect(invoice.getByTestId('status')).toHaveText('changed, invalid');
    await expect(invoice.getByTestId('values')).toHaveCount(0);

    await lines.nth(1).getByLabel('Product').fill('Ink');
    await lines.nth(1).getByLabel('Price').fill('20');
    await invoice.getByRole('button', { name: 'Last line first' }).click();
    await expect(lines.nth(0).getByLabel('Product')).toHaveValue('Ink');

    await invoice.getByRole('button', { name: 'Submit' }).click();
    await expect(invoice.getByTestId('values')).toHaveText(
      '{"customer":"Jane","lines":[{"product":"Ink","price":"20"},{"product":"Paper","price":""}]}'
    );

    await lines.nth(0).getByRole('button', { name: 'Remove' }).click();
    await expect(lines).toHaveCount(1);
    await expect(lines.nth(0).getByLabel('Product')).toHaveValue('Paper');
  });

  test('the list has a validation of its own, and reset brings its rows back', async ({
    page
  }) => {
    const { invoice, lines } = await openInvoice(page);

    await invoice.getByLabel('Customer').fill('Jane');
    await lines.nth(0).getByRole('button', { name: 'Remove' }).click();
    await expect(lines).toHaveCount(0);

    await invoice.getByRole('button', { name: 'Submit' }).click();
    await expect(invoice.getByText('Add a line')).toBeVisible();

    await invoice.getByRole('button', { name: 'Reset' }).click();
    await expect(lines).toHaveCount(1);
    await expect(invoice.getByText('Add a line')).toHaveCount(0);
    await expect(invoice.getByLabel('Customer')).toHaveValue('');
    await expect(invoice.getByTestId('status')).toHaveText('unchanged, valid');
  });

  test('typing into one of a thousand rows renders that row only', async ({
    page
  }) => {
    const { invoice, lines } = await openInvoice(page, '?lines=1000');

    await expect(lines).toHaveCount(1000);

    const renders = () =>
      lines.evaluateAll((all) =>
        all.map((line) => Number(line.getAttribute('data-renders')))
      );
    const before = await renders();
    const started = Date.now();

    await lines.nth(500).getByLabel('Product').pressSequentially('abcdefghij');

    const elapsed = Date.now() - started;
    const after = await renders();

    await expect(lines.nth(500).getByLabel('Product')).toHaveValue(
      'abcdefghijProduct 501'
    );
    expect(after[500] - before[500]).toBeGreaterThanOrEqual(10);
    expect(
      after.filter((count, index) => count !== before[index])
    ).toHaveLength(1);
    // Ten keys; far from the seconds a list that renders every row would take
    expect(elapsed).toBeLessThan(2000);
    await expect(invoice.getByTestId('status')).toHaveText('changed, valid');
  });
});
