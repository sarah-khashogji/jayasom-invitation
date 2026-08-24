const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const state = () => {
  const nodes = [...document.querySelectorAll('#progress .pg-node')].map(n => n.classList.contains('lit'));
  const links = [...document.querySelectorAll('#progress .pg-link')].map(n => n.classList.contains('drawn'));
  return { nodes, links };
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.goto(URL + '#rsvp');
  await page.waitForTimeout(1400);
  console.log('step 0 (nothing answered):', JSON.stringify(await page.evaluate(state)));

  const steps = [
    ['Sarah Khashoggi', 'link-1'],
    ['+966 55 123 4567', 'link-2'],
    ['sarah@jayasom.com', 'link-3'],
  ];
  for (const [val, tag] of steps) {
    await page.fill('#fInput', val);
    await page.click('#fNext');
    await page.waitForTimeout(1500);
    console.log(`${tag}:`.padEnd(9), JSON.stringify(await page.evaluate(state)));
    await page.screenshot({ path: `${OUT}/y-${tag}.png` });
  }

  // going back must retract the line it drew
  await page.click('#fBack');
  await page.waitForTimeout(900);
  console.log('after Back:', JSON.stringify(await page.evaluate(state)));

  await page.click('#fNext');
  await page.waitForTimeout(1300);
  await page.click('.choice');
  await page.waitForTimeout(1200);
  console.log('all four: ', JSON.stringify(await page.evaluate(state)));
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${OUT}/y-done.png` });

  await ctx.close();
  await browser.close();
  console.log(errs.length ? 'ERRORS: ' + errs.join('; ') : 'no page errors');
})();
