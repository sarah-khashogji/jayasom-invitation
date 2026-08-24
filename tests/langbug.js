const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');

const IDS = ['heroEn', 'heroAr', 'verse', 'dDate', 'dPlace', 'dDressLab', 'dDress', 'rsvpBy'];

const count = (ids) => ids.map((id) => {
  const e = document.getElementById(id);
  return id + '  ' + e.querySelectorAll('.w.in').length + '/' + e.querySelectorAll('.w').length;
});

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.waitForTimeout(10500);            // mid word-reveal; chrome is already up
  await page.click('#langBtn');
  await page.waitForTimeout(6000);             // long past when the reveal would end
  const rows = await page.evaluate(count, IDS);
  console.log('words visible after toggling language mid-reveal:');
  rows.forEach((r) => console.log('   ' + r));
  const ctaIn = await page.evaluate(() => document.getElementById('beginBtn').classList.contains('in'));
  console.log('   beginBtn visible:', ctaIn);
  await browser.close();
})();
