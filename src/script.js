(function () {
'use strict';

/* ══════════════════════════ copy ══════════════════════════ */
const COPY = {
  en: {
    lang: 'عربي', skip: 'Skip',
    heroA: 'An evening at AMAALA',
    heroB: 'رحلتك تبدأ هنا',
    verse: 'The evening will begin with a question.\nWhat it reveals is yours to discover.',
    date: 'Sunday · 13 September · 5:30 PM',
    place: 'Jayasom · AMAALA · Red Sea',
    dressLab: 'Dress code', dress: 'Smart casual resort wear',
    cdD: 'Days', cdH: 'Hours', cdM: 'Minutes',
    rsvpBy: 'Kindly respond by 6 September',
    begin: 'Begin the Discovery',
    steps: [
      { label: 'Your name',      type: 'text',  ac: 'name',  im: 'text',  cap: 'words' },
      { label: 'Mobile number',  type: 'tel',   ac: 'tel',   im: 'tel',   cap: 'off'   },
      { label: 'Email address',  type: 'email', ac: 'email', im: 'email', cap: 'off'   },
      { label: 'Will you join us?', type: 'choice',
        options: [{ v: 'yes', t: 'Yes, I will be there' }, { v: 'no', t: 'I cannot attend' }] }
    ],
    next: 'Continue', back: 'Back',
    err: { name: 'Please enter your name',
           tel: 'Please enter a valid mobile number',
           email: 'Please enter a valid email address' },
    doneA: 'Your Place Is Written',
    doneB: 'موعدك مكتوبٌ بين النجوم',
    doneVerse: 'We will see you under this sky, on the thirteenth of September.',
    cal: 'Add to calendar',
    noA: 'The Stars Will Keep Your Place',
    noB: 'النجوم تحفظ مكانك',
    noVerse: 'Until another evening.'
  },
  ar: {
    lang: 'EN', skip: 'تخطٍّ',
    heroA: 'رحلتك تبدأ هنا',
    heroB: 'An evening at AMAALA',
    verse: 'المساء سيبدأ بسؤال.\nوما يكشفه لك، وحدك من يكتشفه.',
    date: 'الأحد ١٣ سبتمبر · \u2066٥:٣٠\u2069 مساءً',
    place: 'جاياسوم · أمالا · البحر الأحمر',
    dressLab: 'الزيّ المقترح', dress: 'أناقة غير رسمية',
    cdD: 'يوم', cdH: 'ساعة', cdM: 'دقيقة',
    rsvpBy: 'نرجو تأكيد الحضور قبل ٦ سبتمبر',
    begin: 'ابدأ الاكتشاف',
    steps: [
      { label: 'الاسم',                type: 'text',  ac: 'name',  im: 'text',  cap: 'words' },
      { label: 'رقم الجوال',           type: 'tel',   ac: 'tel',   im: 'tel',   cap: 'off'   },
      { label: 'البريد الإلكتروني',    type: 'email', ac: 'email', im: 'email', cap: 'off'   },
      { label: 'هل ستكون معنا؟', type: 'choice',
        options: [{ v: 'yes', t: 'نعم، سأكون هناك' }, { v: 'no', t: 'لن أتمكن من الحضور' }] }
    ],
    next: 'متابعة', back: 'رجوع',
    err: { name: 'الرجاء إدخال الاسم',
           tel: 'الرجاء إدخال رقم جوال صحيح',
           email: 'الرجاء إدخال بريد إلكتروني صحيح' },
    doneA: 'موعدك مكتوبٌ بين النجوم',
    doneB: 'Your Place Is Written',
    doneVerse: 'نلقاك تحت هذه السماء، في الثالث عشر من سبتمبر.',
    cal: 'أضف إلى التقويم',
    noA: 'النجوم تحفظ مكانك',
    noB: 'The Stars Will Keep Your Place',
    noVerse: 'إلى مساءٍ آخر.'
  }
};

/* ════════════════ WHERE THE RSVP ANSWERS GO ════════════════
   The only place in this page that knows about a destination. To send answers
   somewhere else — a SharePoint list, Power Automate, an internal API — change
   `endpoint`, `fields` and `mode` and redeploy. Nothing else depends on it.

   mode 'form' — URL-encoded POST through a hidden iframe. What Jotform and most
                 form services expect, and it sidesteps cross-origin blocking.
   mode 'json' — JSON POST via fetch. For your own API, which must allow CORS.

   Currently: Jotform "Jayasom AMAALA — Opening RSVP" (form 262356522129052).
   ══════════════════════════════════════════════════════════ */
const RSVP = {
  endpoint: 'https://submit.jotform.com/submit/262356522129052',
  mode: 'form',
  fields: {
    name:        'q2_q2_textbox0',
    mobile:      'q3_q3_textbox1',
    email:       'q4_q4_email2',
    attending:   'q5_q5_radio3',
    language:    'q6_q6_textbox4',
    submittedAt: 'q7_q7_textbox5'
  },
  extra: { formID: '262356522129052' },
  /* Jotform stores this choice verbatim, so send words rather than yes/no codes */
  attendingValue: { yes: 'Yes', no: 'No' }
};

const LETTERS = __CONSTELLATION__;
const EVENT_AT = new Date('2026-09-13T17:30:00+03:00');
const PERSONAL = [[26, 52], [80, 24], [128, 60], [178, 28]];
const PLINKS = [[0, 1], [1, 2], [2, 3]];

const $ = (id) => document.getElementById(id);
const NS = 'http://www.w3.org/2000/svg';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine = matchMedia('(pointer: fine)').matches;

let lang = 'en';
let timers = [];
const later = (fn, ms) => { timers.push(setTimeout(fn, ms)); };
const clearAll = () => { timers.forEach(clearTimeout); timers = []; };

/* ══════════════════════════ the sky ══════════════════════════ */
const cv = $('sky'), cx = cv.getContext('2d', { alpha: true });
let W = 0, H = 0, DPR = 1, stars = [], shooters = [];
const ptr = { x: -999, y: -999, tx: -999, ty: -999, active: false };
const tilt = { x: 0, y: 0, tx: 0, ty: 0 };

function seedStars() {
  const area = W * H;
  const n = Math.min(520, Math.max(180, Math.round(area / 2900)));
  stars = [];
  for (let i = 0; i < n; i++) {
    const depth = Math.random();
    stars.push({
      x: Math.random(), y: Math.random(),
      r: (0.34 + Math.random() * 1.05) * (0.55 + depth * 0.9),
      a: 0.16 + Math.random() * 0.6,
      ph: Math.random() * Math.PI * 2,
      sp: 0.16 + Math.random() * 0.5,
      p: 0.1 + depth * 0.6,
      warm: Math.random() < 0.24
    });
  }
}

function sizeCanvas() {
  DPR = Math.min(devicePixelRatio || 1, 2);
  W = cv.clientWidth; H = cv.clientHeight;
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  seedStars();
}

function spawnShooter() {
  if (reduce) return;
  const fromLeft = Math.random() < 0.5;
  shooters.push({
    x: fromLeft ? -0.06 * W : 1.06 * W,
    y: (0.05 + Math.random() * 0.22) * H,
    vx: (fromLeft ? 1 : -1) * (W * 0.0125),
    vy: H * 0.0052,
    life: 1
  });
}

let t0 = performance.now();
function frame(now) {
  const t = (now - t0) / 1000;
  cx.clearRect(0, 0, W, H);

  ptr.x += (ptr.tx - ptr.x) * 0.08;
  ptr.y += (ptr.ty - ptr.y) * 0.08;
  tilt.x += (tilt.tx - tilt.x) * 0.045;
  tilt.y += (tilt.ty - tilt.y) * 0.045;

  const px = ptr.active ? (ptr.x / W - 0.5) : 0;
  const py = ptr.active ? (ptr.y / H - 0.5) : 0;

  const near = [];
  for (let i = 0; i < stars.length; i++) {
    const s = stars[i];
    const ox = (px * -26 + tilt.x * 30) * s.p;
    const oy = (py * -18 + tilt.y * 24) * s.p;
    const x = s.x * W + ox, y = s.y * H + oy;
    const tw = reduce ? 1 : 0.72 + 0.28 * Math.sin(t * s.sp + s.ph);
    const a = s.a * tw;

    cx.beginPath();
    cx.arc(x, y, s.r, 0, 6.2832);
    cx.fillStyle = s.warm
      ? 'rgba(236,198,129,' + a.toFixed(3) + ')'
      : 'rgba(246,240,236,' + a.toFixed(3) + ')';
    cx.fill();

    if (s.r > 1.15 && a > 0.5) {
      cx.beginPath();
      cx.arc(x, y, s.r * 3.4, 0, 6.2832);
      cx.fillStyle = 'rgba(236,198,129,' + (a * 0.05).toFixed(3) + ')';
      cx.fill();
    }

    if (ptr.active && fine && !reduce && near.length < 7) {
      const dx = x - ptr.x, dy = y - ptr.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 24000) near.push({ x, y, d: Math.sqrt(d2) });
    }
  }

  /* the pointer as a point of light, reaching toward what is near it */
  if (ptr.active && fine && !reduce) {
    const g = cx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 86);
    g.addColorStop(0, 'rgba(246,237,231,.13)');
    g.addColorStop(0.42, 'rgba(236,198,129,.05)');
    g.addColorStop(1, 'rgba(236,198,129,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(ptr.x, ptr.y, 86, 0, 6.2832); cx.fill();

    cx.lineWidth = 0.6;
    for (const s of near) {
      const a = (1 - s.d / 155) * 0.36;
      if (a <= 0) continue;
      cx.strokeStyle = 'rgba(236,198,129,' + a.toFixed(3) + ')';
      cx.beginPath(); cx.moveTo(ptr.x, ptr.y); cx.lineTo(s.x, s.y); cx.stroke();
    }
    cx.beginPath(); cx.arc(ptr.x, ptr.y, 1.5, 0, 6.2832);
    cx.fillStyle = 'rgba(255,252,247,.72)'; cx.fill();
  }

  /* shooting stars */
  for (let i = shooters.length - 1; i >= 0; i--) {
    const s = shooters[i];
    s.x += s.vx; s.y += s.vy; s.life -= 0.011;
    if (s.life <= 0 || s.x < -0.2 * W || s.x > 1.2 * W) { shooters.splice(i, 1); continue; }
    const tx = s.x - s.vx * 13, ty = s.y - s.vy * 13;
    const g = cx.createLinearGradient(tx, ty, s.x, s.y);
    g.addColorStop(0, 'rgba(236,198,129,0)');
    g.addColorStop(1, 'rgba(255,248,238,' + (s.life * 0.8).toFixed(3) + ')');
    cx.strokeStyle = g; cx.lineWidth = 1.5; cx.lineCap = 'round';
    cx.beginPath(); cx.moveTo(tx, ty); cx.lineTo(s.x, s.y); cx.stroke();
    cx.beginPath(); cx.arc(s.x, s.y, 1.9, 0, 6.2832);
    cx.fillStyle = 'rgba(255,252,246,' + (s.life * 0.9).toFixed(3) + ')'; cx.fill();
  }

  requestAnimationFrame(frame);
}

addEventListener('resize', sizeCanvas, { passive: true });
addEventListener('pointermove', (e) => {
  ptr.tx = e.clientX; ptr.ty = e.clientY; ptr.active = true;
}, { passive: true });
addEventListener('pointerleave', () => { ptr.active = false; }, { passive: true });
addEventListener('touchmove', (e) => {
  const t = e.touches[0]; if (!t) return;
  tilt.tx = (t.clientX / innerWidth - 0.5) * 1.1;
  tilt.ty = (t.clientY / innerHeight - 0.5) * 1.1;
}, { passive: true });

function enableTilt() {
  addEventListener('deviceorientation', (e) => {
    if (e.gamma == null) return;
    tilt.tx = Math.max(-1, Math.min(1, e.gamma / 34));
    tilt.ty = Math.max(-1, Math.min(1, ((e.beta || 45) - 45) / 34));
  }, { passive: true });
}
if (typeof DeviceOrientationEvent !== 'undefined' &&
    typeof DeviceOrientationEvent.requestPermission !== 'function') enableTilt();

/* ══════════════════════════ the constellation ══════════════════════════ */
const skel = $('skeleton');
const groups = [];

function buildSkeleton() {
  LETTERS.forEach((L) => {
    const g = document.createElementNS(NS, 'g');
    const lines = [], nodes = [];

    L.seg.forEach(([a, b]) => {
      const p1 = L.pts[a], p2 = L.pts[b];
      const ln = document.createElementNS(NS, 'line');
      ln.setAttribute('class', 'sk-line');
      ln.setAttribute('x1', p1[0]); ln.setAttribute('y1', p1[1]);
      ln.setAttribute('x2', p2[0]); ln.setAttribute('y2', p2[1]);
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      ln.style.setProperty('--len', len.toFixed(2));
      g.appendChild(ln); lines.push(ln);
    });

    L.pts.forEach((p) => {
      const n = document.createElementNS(NS, 'g');
      n.setAttribute('class', 'sk-node');
      const halo = document.createElementNS(NS, 'circle');
      halo.setAttribute('class', 'sk-halo');
      halo.setAttribute('cx', p[0]); halo.setAttribute('cy', p[1]); halo.setAttribute('r', 3.6);
      const core = document.createElementNS(NS, 'circle');
      core.setAttribute('class', 'sk-core');
      core.setAttribute('cx', p[0]); core.setAttribute('cy', p[1]); core.setAttribute('r', 1.05);
      n.appendChild(halo); n.appendChild(core);
      g.appendChild(n); nodes.push(n);
    });

    skel.appendChild(g);
    groups.push({ lines, nodes });
  });
}

/* ══════════════════════════ personal constellation ══════════════════════════ */
function buildPersonal(svg) {
  svg.textContent = '';
  const links = [], nodes = [];
  PLINKS.forEach(([a, b]) => {
    const p1 = PERSONAL[a], p2 = PERSONAL[b];
    const ln = document.createElementNS(NS, 'line');
    ln.setAttribute('class', 'pg-link');
    ln.setAttribute('x1', p1[0]); ln.setAttribute('y1', p1[1]);
    ln.setAttribute('x2', p2[0]); ln.setAttribute('y2', p2[1]);
    ln.style.setProperty('--len', Math.hypot(p2[0] - p1[0], p2[1] - p1[1]).toFixed(2));
    svg.appendChild(ln); links.push(ln);
  });
  PERSONAL.forEach((p) => {
    const n = document.createElementNS(NS, 'g');
    n.setAttribute('class', 'pg-node');
    const halo = document.createElementNS(NS, 'circle');
    halo.setAttribute('class', 'pg-halo');
    halo.setAttribute('cx', p[0]); halo.setAttribute('cy', p[1]); halo.setAttribute('r', 9);
    const core = document.createElementNS(NS, 'circle');
    core.setAttribute('class', 'pg-core');
    core.setAttribute('cx', p[0]); core.setAttribute('cy', p[1]); core.setAttribute('r', 2.1);
    n.appendChild(halo); n.appendChild(core);
    svg.appendChild(n); nodes.push(n);
  });
  return { links, nodes };
}

const pg = buildPersonal($('progress'));
const fin = buildPersonal($('finalMark'));

/* ══════════════════════════ the opening sequence ══════════════════════════ */
let introDone = false;   /* the chrome is up */
let revealDone = false;  /* every last word has settled */

/* Set text as individually revealable words. Arabic shaping is unaffected —
   letters only join inside a word, never across a space. */
function setWords(el, str) {
  el.textContent = '';
  const frag = document.createDocumentFragment();
  str.split('\n').forEach((line, li) => {
    if (li) frag.appendChild(document.createElement('br'));
    line.split(/\s+/).filter(Boolean).forEach((word, wi) => {
      if (wi) frag.appendChild(document.createTextNode(' '));
      const sp = document.createElement('span');
      sp.className = 'w';
      sp.textContent = word;
      frag.appendChild(sp);
    });
  });
  el.appendChild(frag);
  if (el.dataset.settled === '1') showWords(el);
}

function showWords(el) {
  el.dataset.settled = '1';
  el.querySelectorAll('.w').forEach((w) => w.classList.add('in'));
}

/* Words arrive slowly at first and gather pace — the invitation opens the way
   someone reads it aloud. `quicken` shortens each successive gap. */
function revealWords(el, at, gap, quicken) {
  const ws = el.querySelectorAll('.w');
  let t = at;
  ws.forEach((w, i) => {
    later(() => w.classList.add('in'), t);
    t += Math.max(gap - i * (quicken || 0), gap * 0.4);
  });
  later(() => { el.dataset.settled = '1'; }, t);
  return t;
}

const WORDED = ['heroEn', 'heroAr', 'verse', 'dDate', 'dPlace', 'dDressLab', 'dDress', 'rsvpBy'];
const BLOCKS = ['rule1', 'countdown', 'beginBtn'];

/* The invitation copy is laid out but invisible during the intro, which would
   push the constellation to the top of the screen. Hold the mark at the optical
   centre while it draws, then let it rise into its real place as the copy
   arrives — the lift is the transition between the two moments. */
const markEl = $('mark');
function holdMarkCentre() {
  const r = markEl.getBoundingClientRect();
  if (!r.height) return;
  const d = (innerHeight / 2) - (r.top + r.height / 2);
  markEl.style.transition = 'none';
  markEl.style.transform = 'translateY(' + d.toFixed(1) + 'px) scale(1.045)';
  void markEl.offsetWidth;
}
function releaseMark() {
  markEl.style.transition = 'transform 1.75s var(--ease)';
  markEl.style.transform = 'translateY(0) scale(1)';
}

function revealContent(from) {
  later(releaseMark, from - 260);

  let t = revealWords($('heroEn'), from, 260, 18);
  t = revealWords($('heroAr'), t + 180, 200, 14);
  later(() => $('rule1').classList.add('in'), t + 40);
  t = revealWords($('verse'), t + 320, 105, 4);
  t = revealWords($('dDate'), t + 250, 66);
  t = revealWords($('dPlace'), t + 80, 56);
  t = revealWords($('dDressLab'), t + 80, 50);
  t = revealWords($('dDress'), t, 50);
  later(() => $('countdown').classList.add('in'), t + 100);
  t = revealWords($('rsvpBy'), t + 170, 44);
  later(() => $('beginBtn').classList.add('in'), t + 130);
  later(settle, t + 420);
}

/* The reveal owns the screen while it runs: Skip is the only control, and the
   language toggle only appears once there is nothing left to interrupt. */
function settle() {
  revealDone = true;
  introDone = true;
  $('chrome').classList.add('in');
  $('skipBtn').classList.remove('in');
}

function finishIntro() {
  if (revealDone) return;
  clearAll();
  releaseMark();
  groups.forEach((g) => {
    g.nodes.forEach((n) => n.classList.add('lit'));
    g.lines.forEach((l) => l.classList.add('drawn'));
  });
  skel.classList.add('faded');
  $('realmark').classList.add('shown');
  WORDED.forEach((id) => showWords($(id)));
  BLOCKS.forEach((id) => $(id).classList.add('in'));
  settle();
}

function litSky() { requestAnimationFrame(() => cv.classList.add('lit')); }

function playIntro() {
  $('stInvite').classList.add('on');
  litSky();

  if (reduce) { finishIntro(); return; }

  holdMarkCentre();
  $('skipBtn').classList.add('in');

  /* the first letters are drawn slowly, the last ones flow */
  const START = 1500;
  let at = START;
  groups.forEach((g, i) => {
    g.nodes.forEach((n, k) => later(() => n.classList.add('lit'), at + k * 62));
    g.lines.forEach((l, k) => later(() => l.classList.add('drawn'), at + 330 + k * 70));
    at += Math.max(880 - i * 62, 480);
  });

  const end = at + 820;
  later(() => { skel.classList.add('faded'); $('realmark').classList.add('shown'); }, end);
  revealContent(end + 1000);
}

/* ══════════════════════════ stages ══════════════════════════ */
let stage = 'invite';
function goStage(name) {
  const map = { invite: 'stInvite', form: 'stForm', done: 'stDone' };
  const from = $(map[stage]), to = $(map[name]);
  if (from === to) return;
  from.classList.add('out'); from.classList.remove('on');
  later(() => from.classList.remove('out'), 900);
  later(() => {
    to.classList.add('on');
    if (name === 'form') { paintStep(); focusStep(); }
  }, 620);
  stage = name;
}

/* ══════════════════════════ the form ══════════════════════════ */
const answers = { name: '', mobile: '', email: '', attending: null };
const KEYS = ['name', 'mobile', 'email', 'attending'];
let step = 0;

const input = $('fInput'), choicesEl = $('fChoices'), errEl = $('fErr');

function stepDef() { return COPY[lang].steps[step]; }

function paintStep() {
  const s = stepDef(), c = COPY[lang];
  $('fLabel').textContent = s.label;
  errEl.classList.remove('show');
  $('fBack').hidden = step === 0;
  $('fBack').textContent = c.back;

  document.querySelector('.f-nav').classList.toggle('solo', s.type === 'choice');

  const field = $('form');
  field.classList.remove('enter');
  void field.offsetWidth;
  field.classList.add('enter');

  if (s.type === 'choice') {
    input.hidden = true; choicesEl.hidden = false; $('fNext').hidden = true;
    choicesEl.textContent = '';
    s.options.forEach((o) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'choice'; b.textContent = o.t;
      b.addEventListener('click', () => { answers.attending = o.v; ignite(3); later(submit, 620); });
      choicesEl.appendChild(b);
    });
  } else {
    input.hidden = false; choicesEl.hidden = true; $('fNext').hidden = false;
    $('fNext').textContent = c.next;
    input.type = s.type; input.setAttribute('autocomplete', s.ac);
    input.setAttribute('inputmode', s.im); input.setAttribute('autocapitalize', s.cap);
    input.value = answers[KEYS[step]] || '';
  }
}

function focusStep() {
  if (stepDef().type !== 'choice') later(() => input.focus({ preventScroll: true }), 420);
}

/* Each answered field lights its star and reaches a line back to the last one,
   so the guest watches their own constellation form as they fill the form. */
function ignite(i) {
  pg.nodes[i].classList.add('lit');
  if (i > 0) later(() => pg.links[i - 1].classList.add('drawn'), 220);
}
function dim(i) {
  pg.nodes[i].classList.remove('lit');
  if (i > 0) pg.links[i - 1].classList.remove('drawn');
}

function validate() {
  const v = input.value.trim(), c = COPY[lang];
  if (step === 0) { if (v.length < 2) return c.err.name; }
  if (step === 1) { if ((v.match(/\d/g) || []).length < 7) return c.err.tel; }
  if (step === 2) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return c.err.email; }
  return null;
}

$('form').addEventListener('submit', (e) => {
  e.preventDefault();
  const bad = validate();
  if (bad) { errEl.textContent = bad; errEl.classList.add('show'); input.focus(); return; }
  answers[KEYS[step]] = input.value.trim();
  ignite(step);
  step++; paintStep(); focusStep();
});

$('fBack').addEventListener('click', () => {
  if (step === 0) return;
  step--; dim(step); paintStep(); focusStep();
});

/* ══════════════════════════ submit ══════════════════════════ */
function submit() {
  const c = COPY[lang], coming = answers.attending === 'yes';

  const payload = {
    name: answers.name,
    mobile: answers.mobile,
    email: answers.email,
    attending: answers.attending,
    language: lang,
    submittedAt: new Date().toISOString()
  };
  window.JAYASOM_RSVP = payload;
  send(payload);

  $('doneEn').textContent = coming ? c.doneA : c.noA;
  $('doneAr').textContent = coming ? c.doneB : c.noB;
  $('doneVerse').textContent = coming ? c.doneVerse : c.noVerse;
  $('calBtn').textContent = c.cal;
  $('calBtn').hidden = !coming;

  fin.nodes.forEach((n) => n.classList.add('lit'));
  goStage('done');
  later(() => {
    fin.links.forEach((l, i) => later(() => l.classList.add('drawn'), i * 260));
  }, 900);
  ['doneEn', 'doneAr', 'doneRule', 'doneVerse', 'calBtn'].forEach((id, i) =>
    later(() => $(id).classList.add('in'), 1500 + i * 200));
}

/* ══════════════════════════ sending ══════════════════════════ */
/* Kept deliberately quiet: a guest is never shown a technical error on an
   invitation. Failures are recorded on the page for diagnosis instead, which is
   why the first live RSVP must be checked at the destination before the link
   goes out. */
function send(payload) {
  const data = {};
  Object.keys(RSVP.fields).forEach((k) => {
    let v = payload[k];
    if (k === 'attending' && RSVP.attendingValue) v = RSVP.attendingValue[v] || v;
    data[RSVP.fields[k]] = v == null ? '' : String(v);
  });
  Object.assign(data, RSVP.extra || {});

  window.JAYASOM_SENT = data;

  try {
    if (RSVP.mode === 'json') {
      fetch(RSVP.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).then((r) => { window.JAYASOM_SEND_OK = r.ok; })
        .catch((e) => { window.JAYASOM_SEND_ERR = String(e); });
      return;
    }

    /* A real form POST into a hidden iframe: no cross-origin preflight, and it
       survives the page being closed the instant the guest is done. */
    let frame = document.getElementById('rsvpSink');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.id = 'rsvpSink';
      frame.name = 'rsvpSink';
      frame.setAttribute('aria-hidden', 'true');
      frame.style.cssText = 'position:absolute;width:0;height:0;border:0;left:-9999px';
      document.body.appendChild(frame);
    }
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = RSVP.endpoint;
    form.target = 'rsvpSink';
    form.style.display = 'none';
    form.acceptCharset = 'utf-8';
    Object.keys(data).forEach((k) => {
      const i = document.createElement('input');
      i.type = 'hidden'; i.name = k; i.value = data[k];
      form.appendChild(i);
    });
    document.body.appendChild(form);
    form.submit();
    later(() => form.remove(), 4000);
    window.JAYASOM_SEND_OK = true;
  } catch (e) {
    window.JAYASOM_SEND_ERR = String(e);
  }
}

/* ══════════════════════════ decline path ══════════════════════════ */
/* handled inside submit() — the closing simply changes voice. */

/* ══════════════════════════ countdown ══════════════════════════ */
const AR_DIGITS = ['٠','١','٢','٣','٤','٥','٦','٧','٨','٩'];
const num = (n) => {
  const s = String(n);
  return lang === 'ar' ? s.replace(/\d/g, (d) => AR_DIGITS[+d]) : s;
};

function tickCountdown() {
  const ms = EVENT_AT - Date.now();
  if (ms <= 0) { $('countdown').style.display = 'none'; return; }
  const m = Math.floor(ms / 60000);
  $('cdD').textContent = num(Math.floor(m / 1440));
  $('cdH').textContent = num(Math.floor(m / 60) % 24);
  $('cdM').textContent = num(m % 60);
}

/* ══════════════════════════ calendar ══════════════════════════ */
$('calBtn').addEventListener('click', () => {
  const dt = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, '');
  const end = new Date(EVENT_AT.getTime() + 4 * 3600 * 1000);
  const url = 'https://calendar.google.com/calendar/render?action=TEMPLATE'
    + '&text=' + encodeURIComponent('Jayasom · AMAALA')
    + '&dates=' + dt(EVENT_AT) + '/' + dt(end)
    + '&location=' + encodeURIComponent('Jayasom, AMAALA, Red Sea')
    + '&details=' + encodeURIComponent('A New Constellation Begins.');
  window.open(url, '_blank', 'noopener');
});

/* ══════════════════════════ language ══════════════════════════ */
function applyLang() {
  const c = COPY[lang];
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  document.documentElement.setAttribute('lang', lang);

  $('langBtn').textContent = c.lang;
  $('skipBtn').textContent = c.skip;
  setWords($('heroEn'), c.heroA);
  setWords($('heroAr'), c.heroB);
  setWords($('verse'), c.verse);
  setWords($('dDate'), c.date);
  setWords($('dPlace'), c.place);
  setWords($('dDressLab'), c.dressLab);
  setWords($('dDress'), c.dress);
  $('cdDL').textContent = c.cdD;
  $('cdHL').textContent = c.cdH;
  $('cdML').textContent = c.cdM;
  setWords($('rsvpBy'), c.rsvpBy);
  $('beginBtn').textContent = c.begin;
  $('calBtn').textContent = c.cal;
  tickCountdown();

  /* repaint the form in the new language without losing what is half-typed */
  const pending = stepDef().type === 'choice' ? null : input.value;
  paintStep();
  if (pending) input.value = pending;
}

$('langBtn').addEventListener('click', () => {
  lang = lang === 'en' ? 'ar' : 'en';
  applyLang();
  /* Re-setting the copy replaces the word spans, orphaning any reveal still in
     flight — so a language tap mid-reveal settles the invitation instead of
     leaving the details blank. */
  if (!revealDone) finishIntro();
});

/* ══════════════════════════ wiring ══════════════════════════ */
$('beginBtn').addEventListener('click', () => {
  spawnShooter();
  goStage('form');
});

$('skipBtn').addEventListener('click', finishIntro);
addEventListener('keydown', (e) => {
  if (!revealDone && (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape')) finishIntro();
});
addEventListener('wheel', () => { if (!revealDone) finishIntro(); }, { passive: true, once: true });

/* ══════════════════════════ start ══════════════════════════ */
sizeCanvas();
requestAnimationFrame(frame);
buildSkeleton();
applyLang();
paintStep();
tickCountdown();
setInterval(tickCountdown, 20000);

/* The reveal plays in full every time — it is the piece, not an onboarding step.
   Only a direct link to the form skips it. */
const direct = /(^|[?#&])rsvp\b/.test(location.hash + location.search);

if (direct) {
  litSky();
  finishIntro();
  $('stInvite').classList.add('on');
  goStage('form');
} else {
  playIntro();
}

})();
