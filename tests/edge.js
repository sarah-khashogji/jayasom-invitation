const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const errs = [];

  // 1 — reduced motion: must land on the finished invitation immediately
  {
    const ctx = await browser.newContext({
      viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
      reducedMotion: 'reduce'
    });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('reduced: ' + e.message));
    await page.goto(URL);
    await page.waitForTimeout(1200);
    await page.screenshot({ path: `${OUT}/x-reduced-motion.png` });
    const ctaVisible = await page.isVisible('#beginBtn');
    const logoOpacity = await page.$eval('#realmark', el => getComputedStyle(el).opacity);
    console.log('reduced-motion: cta visible =', ctaVisible, '| logo opacity =', logoOpacity);
    await ctx.close();
  }

  // 2 — very small screen: everything must remain reachable by scrolling
  {
    const ctx = await browser.newContext({ viewport: { width: 320, height: 568 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('small: ' + e.message));
    await page.goto(URL);
    await page.click('#skipBtn');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/x-small-top.png` });
    await page.$eval('#beginBtn', el => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/x-small-bottom.png` });
    // can it actually be clicked?
    await page.click('#beginBtn');
    await page.waitForTimeout(1400);
    const onForm = await page.isVisible('#fLabel');
    console.log('320x568: reached form =', onForm);
    await ctx.close();
  }

  // 3 — keyboard only: tab + enter through the whole form
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('kbd: ' + e.message));
    await page.goto(URL + '#rsvp');
    await page.waitForTimeout(1500);
    await page.keyboard.type('Layla Al-Rashid');
    await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await page.keyboard.type('+966501234567');
    await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await page.keyboard.type('layla@example.com');
    await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.screenshot({ path: `${OUT}/x-kbd-choice.png` });
    await page.keyboard.press('Tab');
    const focused = await page.evaluate(() => document.activeElement.textContent.trim());
    console.log('keyboard: first tab target on choice step =', JSON.stringify(focused));
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3600);
    await page.screenshot({ path: `${OUT}/x-kbd-done.png` });
    console.log('keyboard payload:', JSON.stringify(await page.evaluate(() => window.JAYASOM_RSVP)));
    await ctx.close();
  }

  // 4 — returning visitor: sky lit, no replay
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('pageerror', e => errs.push('return: ' + e.message));
    await page.goto(URL);
    await page.waitForTimeout(600);
    await page.reload();
    await page.waitForTimeout(1800);
    await page.screenshot({ path: `${OUT}/x-returning.png` });
    const skyLit = await page.$eval('#sky', el => getComputedStyle(el).opacity);
    console.log('returning visitor: sky opacity =', skyLit);
    await ctx.close();
  }

  await browser.close();
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no page errors');
})();
