
const puppeteer = require('puppeteer');

(async () => {
  console.log('Starting puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  // Listen for console events
  page.on('console', msg => {
    const type = msg.type();
    if (type === 'error' || type === 'warning') {
      console.log(`[Browser ${type.toUpperCase()}]: ${msg.text()}`);
    }
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.error(`[Page Error]: ${error.message}`);
  });

  // Listen for request failures
  page.on('requestfailed', request => {
    console.error(`[Request Failed]: ${request.url()} - ${request.failure().errorText}`);
  });

  try {
    console.log('Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 30000 });
    console.log('Page loaded successfully.');

    // Take a screenshot just in case
    await page.screenshot({ path: 'page-screenshot.png' });
    console.log('Screenshot saved to page-screenshot.png');
    
    // Check for specific elements to ensure critical rendering
    const title = await page.title();
    console.log(`Page Title: ${title}`);

  } catch (error) {
    console.error(`Navigation failed: ${error.message}`);
  } finally {
    await browser.close();
    console.log('Browser closed.');
  }
})();
