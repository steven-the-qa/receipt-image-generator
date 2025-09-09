import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/edit-receipt');
  await expect(page.getByRole('heading', { name: 'Format Receipt' })).toBeVisible();
});

test('Format Receipt: blur toggle updates preview', async ({ page }) => {
  // Blur on
  await page.getByRole('button', { name: 'Blur' }).click();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  const receipt = page.locator('section#receipt:visible');
  await expect(receipt).toHaveClass(/blur-\[2px\]/);

  // Blur off
  await page.getByRole('button', { name: 'Clear' }).click();
  await expect(page.getByRole('button', { name: 'Blur' })).toBeVisible();
  await expect(receipt).not.toHaveClass(/blur-\[2px\]/);
});

test('Format Receipt: $ visibility toggle affects totals', async ({ page }) => {
  const subtotal = page.locator('section#receipt:visible #subtotal');
  const tax = page.locator('section#receipt:visible #tax');
  const total = page.locator('section#receipt:visible #total');

  // Initially the dollar sign is suppressed in USD
  await expect(subtotal).not.toContainText('$');
  await expect(tax).not.toContainText('$');
  await expect(total).not.toContainText('$');

  // Show $
  await page.getByRole('button', { name: '$ Show $' }).click();
  await expect(page.getByRole('button', { name: '$ Hide $' })).toBeVisible();
  await expect(subtotal).toContainText('$');
  await expect(tax).toContainText('$');
  await expect(total).toContainText('$');

  // Hide $
  await page.getByRole('button', { name: '$ Hide $' }).click();
  await expect(page.getByRole('button', { name: '$ Show $' })).toBeVisible();
  await expect(subtotal).not.toContainText('$');
  await expect(tax).not.toContainText('$');
  await expect(total).not.toContainText('$');
});

test('Format Receipt: currency toggle switches formatting between USD and CAD', async ({ page }) => {
  const subtotal = page.locator('section#receipt:visible #subtotal');

  // Ensure $ is visible for easier detection
  const showDollarBtn = page.getByRole('button', { name: '$ Show $' });
  if (await showDollarBtn.isVisible()) {
    await showDollarBtn.click();
  }

  // Switch to CAD (fr-CA) formatting
  await page.getByRole('button', { name: 'CAD Format' }).click();
  await expect(subtotal).toContainText('0,00');

  // Switch back to USD formatting
  await page.getByRole('button', { name: 'USD Format' }).click();
  await expect(subtotal).toContainText('0.00');
});

test('Format Receipt: visibility checkboxes hide/show receipt elements', async ({ page }) => {
  const address = page.locator('section#receipt:visible #address');
  const phone = page.locator('section#receipt:visible #phone');
  const date = page.locator('section#receipt:visible #date');
  const subtotal = page.locator('section#receipt:visible #subtotal');
  const tax = page.locator('section#receipt:visible #tax');
  const total = page.locator('section#receipt:visible #total');

  // Uncheck Store Address
  await page.getByLabel('Store Address').click();
  await expect(address).toBeHidden();

  // Uncheck Store Phone Number
  await page.getByLabel('Store Phone Number').click();
  await expect(phone).toBeHidden();

  // Uncheck Purchase Date & Time
  await page.getByLabel('Purchase Date & Time').click();
  await expect(date).toBeHidden();

  // Uncheck Total Price Details
  await page.getByLabel('Total Price Details').click();
  await expect(subtotal).toBeHidden();
  await expect(tax).toBeHidden();
  await expect(total).toBeHidden();

  // Re-check to show again
  await page.getByLabel('Total Price Details').click();
  await expect(subtotal).toBeVisible();
  await expect(tax).toBeVisible();
  await expect(total).toBeVisible();
});
