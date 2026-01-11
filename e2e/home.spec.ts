import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  // Note: This relies on the app actually running.
  // Alternatively we can just check if we can navigate.
  await expect(page).toHaveTitle(/E-commerce App/i); 
});
