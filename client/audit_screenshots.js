import { chromium } from 'playwright';
import fs from 'fs';

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Logging in...');
  await page.goto('https://smarterpsolution.duckdns.org/login');
  
  // Wait for login form
  const emailInput = page.locator('input[placeholder*="admin@smarterp.in"], input[type="text"]').first();
  await emailInput.waitFor();
  await emailInput.fill('admin@smarterp.in');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Sign In")');

  await page.waitForURL('**/dashboard');
  await page.screenshot({ path: 'audit_dashboard.png' });
  console.log('Saved audit_dashboard.png');

  await page.goto('https://smarterpsolution.duckdns.org/fees');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'audit_fees.png' });
  console.log('Saved audit_fees.png');

  await page.goto('https://smarterpsolution.duckdns.org/settings');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'audit_settings.png' });
  console.log('Saved audit_settings.png');

  // Mobile Screenshots
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('https://smarterpsolution.duckdns.org/dashboard');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'audit_dashboard_mobile.png' });
  console.log('Saved audit_dashboard_mobile.png');

  await browser.close();
})();
