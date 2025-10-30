
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    await page.goto('http://localhost:8080');

    // Wait for the loading screen to disappear
    await page.waitForSelector('#loading-screen', { state: 'hidden', timeout: 15000 });

    // Wait a moment for the scene to settle
    await page.waitForTimeout(2000);

    // Capture screenshot
    await page.screenshot({ path: 'verification/screenshot.png' });

    console.log('Verification successful, screenshot captured.');

  } catch (error) {
    console.error('Verification failed:', error);
    await page.screenshot({ path: 'verification/error.png' });
    process.exit(1);
  } finally {
    await browser.close();
  }
})();
