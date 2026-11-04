const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');

  // Wait for the app to load
  await page.waitForTimeout(2000);

  // Click the heart to open the HeartRecoveryModal
  await page.click('.text-destructive');

  await page.waitForTimeout(1000);

  await page.screenshot({ path: 'gamification_screenshot.png' });

  await browser.close();
})();
