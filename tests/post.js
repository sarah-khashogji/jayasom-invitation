const { chromium } = require('playwright');
const path = require('path');
const PAGE = 'file://' + path.resolve(__dirname, 'dist/index.html');

/* Intercept the submission so we can see exactly what Jotform would receive,
   without needing network access to Jotform from this sandbox. */
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  const posts = [];
  await page.route('**/submit.jotform.com/**', async (route) => {
    const req = route.request();
    posts.push({ method: req.method(), url: req.url(), body: req.postData() });
    await route.fulfill({ status: 200, contentType: 'text/html', body: '<html>ok</html>' });
  });

  await page.goto(PAGE + '#rsvp');
  await page.waitForTimeout(1400);
  await page.fill('#fInput', 'Sarah Khashoggi');   await page.click('#fNext'); await page.waitForTimeout(400);
  await page.fill('#fInput', '+966 55 123 4567');  await page.click('#fNext'); await page.waitForTimeout(400);
  await page.fill('#fInput', 'sarah@jayasom.com'); await page.click('#fNext'); await page.waitForTimeout(700);
  await page.click('.choice');                     await page.waitForTimeout(2500);

  console.log('submissions posted:', posts.length);
  for (const p of posts) {
    console.log('  ' + p.method + ' ' + p.url);
    for (const pair of (p.body || '').split('&')) {
      const [k, v] = pair.split('=');
      console.log('    ' + decodeURIComponent(k || '').padEnd(16) + ' = ' + decodeURIComponent((v || '').replace(/\+/g, ' ')));
    }
  }
  const flags = await page.evaluate(() => ({ ok: window.JAYASOM_SEND_OK, err: window.JAYASOM_SEND_ERR }));
  console.log('  page flags:', JSON.stringify(flags));
  console.log('  guest still sees the closing screen:',
    await page.isVisible('#doneEn'));

  await browser.close();
})();
