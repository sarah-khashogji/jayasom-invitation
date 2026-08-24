const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const probe = () => {
  const q = (s) => document.querySelectorAll(s).length;
  return {
    logo: parseFloat(getComputedStyle(document.getElementById('realmark')).opacity) > 0.5,
    lines: q('#skeleton .sk-line.drawn'),
    words: q('.w.in'),
    total: q('.w'),
    cta: document.getElementById('beginBtn').classList.contains('in')
  };
};

const SHOT = [4000, 7600, 10200, 14000, 16000];

(async () => {
  const browser = await chromium.launch();
  for (const ms of [2000, 4000, 6000, 7600, 8800, 10200, 12000, 14000, 16000]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(URL);
    await page.waitForTimeout(ms);
    const s = await page.evaluate(probe);
    console.log(
      String(ms).padStart(6) + 'ms',
      'logo ' + (s.logo ? 'Y' : '·'),
      '| lines ' + String(s.lines).padStart(2) + '/35',
      '| words ' + String(s.words).padStart(2) + '/' + s.total,
      '| cta ' + (s.cta ? 'Y' : '·')
    );
    if (SHOT.includes(ms)) await page.screenshot({ path: `${OUT}/z-${ms}.png` });
    await ctx.close();
  }
  await browser.close();
})();
