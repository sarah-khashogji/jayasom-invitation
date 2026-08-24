const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');
const OUT = path.resolve(__dirname, 'shots');
fs.mkdirSync(OUT, { recursive: true });

const PHONE = { width: 390, height: 844 };
const DESK  = { width: 1440, height: 900 };

async function fresh(browser, viewport) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
  await page.addInitScript(() => { try { localStorage.clear(); } catch (e) {} });
  return { ctx, page, errs };
}

(async () => {
  const browser = await chromium.launch();
  const allErrs = [];

  // ── intro sequence on phone ──
  {
    const { ctx, page, errs } = await fresh(browser, PHONE);
    await page.goto(URL);
    for (const t of [900, 2200, 3600, 5200, 6600, 8200, 10500]) {
      await page.waitForTimeout(t === 900 ? 900 : 0);
      if (t !== 900) await page.waitForTimeout(0);
    }
    await ctx.close();
  }

  // simpler: separate loads at fixed waits
  const marks = [1000, 2400, 3800, 5400, 7000, 9200, 11000];
  for (const ms of marks) {
    const { ctx, page, errs } = await fresh(browser, PHONE);
    await page.goto(URL);
    await page.waitForTimeout(ms);
    await page.screenshot({ path: `${OUT}/intro-${String(ms).padStart(5,'0')}.png` });
    allErrs.push(...errs.map(e => `[intro ${ms}] ${e}`));
    await ctx.close();
  }

  // ── desktop, settled ──
  {
    const { ctx, page, errs } = await fresh(browser, DESK);
    await page.goto(URL);
    await page.waitForTimeout(11000);
    await page.mouse.move(720, 380);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/desk-invite.png` });
    allErrs.push(...errs.map(e => `[desk] ${e}`));
    await ctx.close();
  }

  // ── form flow on phone ──
  {
    const { ctx, page, errs } = await fresh(browser, PHONE);
    await page.goto(URL);
    await page.click('#skipBtn');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/phone-invite.png` });

    await page.click('#beginBtn');
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/form-1-name.png` });

    // validation error
    await page.click('#fNext');
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUT}/form-1-error.png` });

    await page.fill('#fInput', 'Sarah Khashoggi');
    await page.click('#fNext'); await page.waitForTimeout(700);
    await page.screenshot({ path: `${OUT}/form-2-mobile.png` });

    await page.fill('#fInput', '+966 55 123 4567');
    await page.click('#fNext'); await page.waitForTimeout(700);
    await page.fill('#fInput', 'sarah@jayasom.com');
    await page.click('#fNext'); await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/form-4-attend.png` });

    await page.click('.choice');   // yes
    await page.waitForTimeout(3600);
    await page.screenshot({ path: `${OUT}/done-yes.png` });
    const payload = await page.evaluate(() => window.JAYASOM_RSVP);
    console.log('payload:', JSON.stringify(payload));
    allErrs.push(...errs.map(e => `[form] ${e}`));
    await ctx.close();
  }

  // ── arabic ──
  {
    const { ctx, page, errs } = await fresh(browser, PHONE);
    await page.goto(URL);
    await page.click('#skipBtn');
    await page.waitForTimeout(400);
    await page.click('#langBtn');
    await page.waitForTimeout(900);
    await page.screenshot({ path: `${OUT}/ar-invite.png` });
    await page.click('#beginBtn');
    await page.waitForTimeout(1600);
    await page.screenshot({ path: `${OUT}/ar-form.png` });
    allErrs.push(...errs.map(e => `[ar] ${e}`));
    await ctx.close();
  }

  // ── decline path ──
  {
    const { ctx, page, errs } = await fresh(browser, PHONE);
    await page.goto(URL + '#rsvp');
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${OUT}/direct-rsvp.png` });
    await page.fill('#fInput', 'Test Guest'); await page.click('#fNext'); await page.waitForTimeout(400);
    await page.fill('#fInput', '0551234567'); await page.click('#fNext'); await page.waitForTimeout(400);
    await page.fill('#fInput', 'a@b.com'); await page.click('#fNext'); await page.waitForTimeout(700);
    await page.click('.choices button:nth-child(2)');  // no
    await page.waitForTimeout(3600);
    await page.screenshot({ path: `${OUT}/done-no.png` });
    allErrs.push(...errs.map(e => `[decline] ${e}`));
    await ctx.close();
  }

  await browser.close();
  console.log(allErrs.length ? 'ERRORS:\n' + allErrs.join('\n') : 'no console/page errors');
})();
