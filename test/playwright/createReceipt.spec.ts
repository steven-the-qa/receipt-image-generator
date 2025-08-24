import { test, expect } from '@playwright/test';

test('create a Walgreens receipt', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  const storeNameDropdownTrigger = page.locator('#storeSelect svg')
  await storeNameDropdownTrigger.click();
  await page.locator('#react-select-3-input').fill('Walgreens');
  await page.getByText('Walgreens', { exact: true }).nth(1).click();

  const itemDescription = page.getByTestId('itemDescription');
  await itemDescription.click();
  await itemDescription.fill('Toothpaste');
  const itemPrice = page.getByTestId('itemPrice');
  await itemPrice.click();
  await itemPrice.fill('3.49');
  const itemQuantity = page.getByTestId('itemQuantity');
  await itemQuantity.click();
  await itemQuantity.fill('2');
  const numOfCopies = page.getByTestId('numOfCopies');
  await numOfCopies.click();
  await numOfCopies.fill('1');
  const addItemButton = page.getByTestId('addItem');
  await addItemButton.click();

  const receipt = page.getByTestId('receipt').first();

  await expect(receipt).toContainText('This should fail');
  await expect(receipt).toContainText('Toothpaste');
  await expect(receipt.getByTestId('price')).toContainText('6.98');
});
