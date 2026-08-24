const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');

const SIZES = [
  ['iphone-se',  375, 667],
  ['iphone-13',  390, 844],
  ['pixel-7',    412, 915],
  ['laptop',    1440, 900],
];

(async () => {
  const browser = await chromium.launch();
  for (const [name, width, height] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width, height } });
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.click('#skipBtn');
    await page.waitForTimeout(700);
    const m = await page.evaluate(() => {
      const s = document.getElementById('stInvite');
      const c = document.getElementById('beginBtn').getBoundingClientRect();
      return { bottom: Math.round(c.bottom), vh: innerHeight,
               scroll: s.scrollHeight > s.clientHeight + 1 };
    });
    const fits = m.bottom <= m.vh - 4;
    console.log(`${name.padEnd(11)} ${String(width).padStart(4)}x${height}  CTA bottom ${String(m.bottom).padStart(4)} / ${m.vh}  ${fits ? 'FITS' : 'scrolls'}`);
    await ctx.close();
  }
  await browser.close();
})();
