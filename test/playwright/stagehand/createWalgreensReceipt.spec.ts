import "dotenv/config";
import { Stagehand } from "@browserbasehq/stagehand";
import { test, expect } from '@playwright/test';

// Run on-demand to avoid unexpected AI bills
test.skip('create a Walgreens receipt', async () => {
  const stagehand = new Stagehand({
    env: "LOCAL"
  });

  await stagehand.init();
  const sh = stagehand.page;

  await sh.goto('/');
  await sh.act("Click the Select Store dropdown list");
  await sh.act("Search the list for 'Walgreens' and click it")
  await sh.act("Set item description to 'Toothpaste'");
  await sh.act("Set price to '3.49'");
  await sh.act("Set quantity to '2'");
  await sh.act("Click 'Add Item'");

  const receipt = sh.locator('section#receipt:visible');
  await expect(receipt).toContainText('Toothpaste');
  await expect(sh.locator('section#receipt:visible [data-testid="price"]')).toContainText('6.98');
});
