import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('http://localhost/ShadyMedows');
  await expect(page).toHaveTitle(/Shady Medows/i);
});

test('index page has nav', async ({ page }) => {
  await page.goto('http://localhost/ShadyMedows');
  await expect(page.locator('nav')).toBeVisible();
});

test('amenities page loads', async ({ page }) => {
  await page.goto('http://localhost/ShadyMedows/amenities.html');
  await expect(page).toHaveURL(/amenities/);
});

test('profile page loads', async ({ page }) => {
  await page.goto('http://localhost/ShadyMedows/profile.html');
  await expect(page).toHaveURL(/profile/);
});

test('contact API responds', async ({ page }) => {
  await page.goto('http://localhost/ShadyMedows');
  const response = await page.request.get('http://localhost/ShadyMedows/api/contact.php');
  expect(response.status()).toBeLessThan(500);
});