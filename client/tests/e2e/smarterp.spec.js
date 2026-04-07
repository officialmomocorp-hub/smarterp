const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://smarterpsolution.duckdns.org';

test.describe('SmarterP E2E Journey', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to the app before each test
    await page.goto(BASE_URL);
  });

  test('Main Journey: Login, Dashboard, and Settings', async ({ page }) => {
    console.log(`Starting at URL: ${page.url()}`);
    console.log(`Page Title: ${await page.title()}`);

    // Check if already logged in
    if (page.url().includes('/dashboard')) {
      console.log('Already logged in, skipping login steps...');
    } else {
      // 1. Navigation to Login
      if (page.url() === `${BASE_URL}/` || page.url() === `${BASE_URL}`) {
        const loginLink = page.locator('a:has-text("Login")');
        if (await loginLink.isVisible()) {
          await loginLink.click();
        } else {
          await page.goto(`${BASE_URL}/login`);
        }
      }

      // 2. Perform Login
      console.log('Logging in...');
      try {
        const emailInput = page.locator('input[placeholder*="admin@smarterp.in"], input[type="text"]').first();
        const passwordInput = page.locator('input[type="password"]');
        const signInButton = page.locator('button:has-text("Sign In"), button[type="submit"]');

        await emailInput.waitFor({ state: 'visible', timeout: 15000 });
        await emailInput.fill('admin@smarterp.in');
        await passwordInput.fill('admin123');
        await signInButton.click();
      } catch (e) {
        console.error('Login interaction failed. Current URL:', page.url());
        await page.screenshot({ path: 'login_error.png' });
        throw e;
      }
    }

    // 3. Verify Dashboard Redirection
    console.log('Verifying Dashboard...');
    await page.waitForURL('**/dashboard');
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Check for dashboard elements (Statistics cards)
    const statsCard = page.locator('div.bg-white.rounded-2xl.shadow-sm').first();
    await expect(statsCard).toBeVisible();

    // 4. Navigate to Settings
    console.log('Navigating to Settings...');
    const settingsLink = page.locator('nav a:has-text("Settings"), a[href="/settings"]');
    await expect(settingsLink).toBeVisible();
    await settingsLink.click();

    // 5. Verify Settings Page
    await page.waitForURL('**/settings');
    await expect(page).toHaveURL(/.*settings/);
    
    // Check for "Settings" heading
    const settingsHeading = page.locator('h1, h2, h3').filter({ hasText: /Settings|Profile|General/i }).first();
    await expect(settingsHeading).toBeVisible({ timeout: 10000 });
    
    // Check for form elements or buttons
    const anyButton = page.locator('button').first();
    await expect(anyButton).toBeVisible();
    
    console.log('E2E Journey Completed Successfully!');
  });

});
