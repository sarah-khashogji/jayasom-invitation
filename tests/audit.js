const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, 'dist/index.html');

/* The sky is a gradient from about #16202F at the top to #070A10 at the edges.
   Text is checked against the LIGHTEST ground it can sit on, which is the
   worst case for light type. */
const GROUND = [0x16, 0x20, 0x2f];

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const over = ([r, g, b, a], bg) => [r, g, b].map((c, i) => c * a + bg[i] * (1 - a));

const parse = (s) => {
  const m = s.match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  const p = m[1].split(',').map(Number);
  return [p[0], p[1], p[2], p[3] === undefined ? 1 : p[3]];
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  await page.goto(URL);
  await page.click('#skipBtn');
  await page.waitForTimeout(900);

  const items = await page.evaluate(() => {
    const out = [];
    const sel = '#heroEn,#heroAr,#verse,#dDate,#dPlace,#dDressLab,#dDress,#rsvpBy,#beginBtn,.cd-num,.cd-lab,#langBtn,#skipBtn';
    document.querySelectorAll(sel).forEach((el) => {
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      out.push({
        id: el.id || el.className,
        color: cs.color,
        px: parseFloat(cs.fontSize),
        weight: cs.fontWeight,
        text: (el.textContent || '').trim().slice(0, 34),
        w: Math.round(r.width), h: Math.round(r.height)
      });
    });
    return out;
  });

  console.log('CONTRAST — against the lightest sky (#16202F). AA needs 4.5, or 3.0 at 18.66px+\n');
  let fails = 0;
  for (const it of items) {
    const c = parse(it.color);
    if (!c) continue;
    const eff = over(c, GROUND);
    const cr = ratio(eff, GROUND);
    const large = it.px >= 18.66 || (it.px >= 14 && +it.weight >= 700);
    const need = large ? 3.0 : 4.5;
    const ok = cr >= need;
    if (!ok) fails++;
    console.log(
      (ok ? '  ok  ' : '  ▲   ') +
      it.id.padEnd(12) +
      String(it.px.toFixed(1) + 'px').padStart(8) +
      '  ' + cr.toFixed(2).padStart(5) + ':1' +
      '  (needs ' + need.toFixed(1) + ')  ' +
      JSON.stringify(it.text)
    );
  }

  // tap-target sizes
  console.log('\nTAP TARGETS — 44px is the comfortable minimum\n');
  const taps = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('button, input, a').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (!r.width) return;
      out.push({ id: el.id || el.className, w: Math.round(r.width), h: Math.round(r.height) });
    });
    return out;
  });
  for (const t of taps) {
    const ok = t.h >= 44;
    console.log((ok ? '  ok  ' : '  ▲   ') + t.id.padEnd(14) + t.w + '×' + t.h);
    if (!ok) fails++;
  }

  console.log('\n' + (fails ? fails + ' item(s) flagged' : 'nothing flagged'));
  await browser.close();
})();
