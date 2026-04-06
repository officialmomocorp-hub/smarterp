const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    console.log('Browser launched successfully!');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('Launch failed:', err);
    process.exit(1);
  }
})();
