/**
 * Mobile responsiveness + performance audit for the built site.
 *
 * Re-run this after any markup or CSS change - especially changes to the Thank
 * You view or new homepage sections - to confirm nothing regressed.
 *
 *   npm run build
 *   npm run audit:mobile
 *
 * It serves dist/ on a throwaway port and drives headless Chromium, so it
 * measures the real production output rather than the dev server.
 *
 * Thresholds are the Core Web Vitals "good" boundaries plus the 44px minimum
 * touch target. Exits non-zero if anything fails, so it can gate a deploy.
 */
import { chromium } from 'playwright';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 8971;
const BASE = `http://localhost:${PORT}`;

// Slow 4G + a mid-tier phone CPU. Anything that looks fine only on desktop
// hardware over wifi is not actually fine.
const NET = { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8, offline: false };
const CPU = 4;

const BUDGET = { lcp: 2500, cls: 0.1, totalKB: 1200, tap: 44 };

const VIEWPORTS = [
  { name: 'Galaxy S8', width: 360, height: 740 },
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone Pro Max', width: 430, height: 932 },
  { name: 'iPad mini', width: 768, height: 1024 },
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.ico': 'image/x-icon' };

function serve() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      let file = path.join(DIST, rel === '/' ? 'index.html' : rel);
      if (!file.startsWith(DIST) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
        res.writeHead(404); return res.end('not found');
      }
      const body = fs.readFileSync(file);
      res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream', 'content-length': body.length });
      res.end(body);
    });
    server.listen(PORT, () => resolve(server));
  });
}

const fails = [];
const fail = (m) => { fails.push(m); console.log(`  ❌ ${m}`); };
const pass = (m) => console.log(`  ✅ ${m}`);

/** Effective hit area, counting the ::after overlays used to enlarge icon buttons. */
const HIT_AREA_FN = `(el) => {
  const rc = el.getBoundingClientRect();
  let w = rc.width, h = rc.height;
  const a = getComputedStyle(el, '::after');
  if (a && a.content === '""' && a.position === 'absolute') {
    const aw = parseFloat(a.width), ah = parseFloat(a.height);
    if (!isNaN(aw)) w = Math.max(w, aw);
    if (!isNaN(ah)) h = Math.max(h, ah);
  }
  return { w, h };
}`;

const server = await serve();
const browser = await chromium.launch();

// ---------------------------------------------------------------- layout sweep
console.log('\n=== LAYOUT: overflow, tap targets, console errors ===');
for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 160)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 160)); });
  page.on('response', (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url().replace(BASE, '')}`); });

  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(2200);

  const r = await page.evaluate((hitFn) => {
    const hit = eval(hitFn);
    const de = document.documentElement;
    const small = [];
    const seen = new Set();
    for (const el of document.querySelectorAll('a,button,input,select,textarea,[role=button]')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') continue;
      const rc = el.getBoundingClientRect();
      if (!rc.width || !rc.height) continue;
      const { w, h } = hit(el);
      if (w >= 44 && h >= 44) continue;
      const k = el.tagName + '.' + el.className;
      if (seen.has(k)) continue;
      seen.add(k);
      small.push({ sel: k.toLowerCase().slice(0, 46), hit: `${Math.round(w)}x${Math.round(h)}`,
        txt: (el.textContent || '').trim().slice(0, 20) });
    }
    return { overflow: de.scrollWidth - de.clientWidth, small };
  }, HIT_AREA_FN);

  console.log(`\n ${vp.name} (${vp.width}x${vp.height})`);
  r.overflow > 1 ? fail(`${vp.name}: horizontal overflow +${r.overflow}px`) : pass('no horizontal overflow');
  if (r.small.length) {
    fail(`${vp.name}: ${r.small.length} tap target(s) under ${BUDGET.tap}px`);
    for (const s of r.small) console.log(`       ${s.hit.padEnd(9)} ${s.sel}  "${s.txt}"`);
  } else pass(`all tap targets >= ${BUDGET.tap}px`);
  errors.length ? fail(`${vp.name}: ${errors.length} console error(s): ${errors[0]}`) : pass('no console errors');
  failed.length ? fail(`${vp.name}: failed requests: ${[...new Set(failed)].join(', ')}`) : pass('no failed requests');
  await ctx.close();
}

// ------------------------------------------------------------ vitals and bytes
console.log('\n=== VITALS + PAYLOAD (slow 4G, 4x CPU, 390x844) ===');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', NET);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });

  const urls = new Map(), got = new Map();
  cdp.on('Network.requestWillBeSent', (e) => urls.set(e.requestId, e.request.url));
  cdp.on('Network.dataReceived', (e) => got.set(e.requestId, (got.get(e.requestId) || 0) + e.dataLength));

  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 180000 });
  await page.waitForTimeout(11000);

  const m = await page.evaluate(() => new Promise((res) => {
    let lcp = 0, lcpEl = '', cls = 0, tbt = 0;
    const shifts = [];
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) {
      lcp = Math.round(e.startTime);
      lcpEl = (e.element?.tagName || '') + '.' + (e.element?.className || '').toString().slice(0, 34) + ' ' + (e.url || '').split('/').pop();
    } }).observe({ type: 'largest-contentful-paint', buffered: true }); } catch {}
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) {
      cls += e.value;
      shifts.push({ v: +e.value.toFixed(4), t: Math.round(e.startTime),
        s: (e.sources || []).map((x) => (x.node?.tagName || '?') + '.' + (x.node?.className || '').toString().slice(0, 26)).slice(0, 2).join(' | ') });
    } }).observe({ type: 'layout-shift', buffered: true }); } catch {}
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) tbt += e.duration; })
      .observe({ type: 'longtask', buffered: true }); } catch {}
    const paints = {};
    setTimeout(() => {
      for (const p of performance.getEntriesByType('paint')) paints[p.name] = Math.round(p.startTime);
      res({ lcp, lcpEl, cls: +cls.toFixed(4), tbt: Math.round(tbt), fcp: paints['first-contentful-paint'],
        shifts: shifts.sort((a, b) => b.v - a.v).slice(0, 5) });
    }, 700);
  }));

  const rows = [...got.entries()].map(([id, b]) => ({ u: (urls.get(id) || '?').replace(BASE, ''), b })).sort((a, b) => b.b - a.b);
  const totalKB = Math.round(rows.reduce((s, r) => s + r.b, 0) / 1024);
  const cat = (re) => Math.round(rows.filter((r) => re.test(r.u)).reduce((s, r) => s + r.b, 0) / 1024);

  console.log(`\n  FCP ${m.fcp}ms   LCP ${m.lcp}ms   CLS ${m.cls}   long tasks ${m.tbt}ms`);
  console.log(`  LCP element: ${m.lcpEl}`);
  console.log(`  payload ${totalKB} KB over ${rows.length} requests  (~${(totalKB * 8 / 1600).toFixed(1)}s on 1.6Mbps)`);
  console.log(`  video ${cat(/\.(mp4|mov|webm)/i)} KB | fonts ${cat(/\.woff2?/i)} KB | images ${cat(/\.(jpe?g|png|webp|svg|avif)/i)} KB`);
  console.log('\n  heaviest requests:');
  for (const r of rows.slice(0, 8)) console.log(`    ${(r.b / 1024).toFixed(0).padStart(6)} KB  ${r.u.slice(0, 74)}`);

  m.lcp > BUDGET.lcp ? fail(`LCP ${m.lcp}ms exceeds ${BUDGET.lcp}ms`) : pass(`LCP ${m.lcp}ms`);
  if (m.cls > BUDGET.cls) {
    fail(`CLS ${m.cls} exceeds ${BUDGET.cls}`);
    for (const s of m.shifts) console.log(`       ${s.v} @${s.t}ms  ${s.s}`);
  } else pass(`CLS ${m.cls}`);
  totalKB > BUDGET.totalKB ? fail(`payload ${totalKB}KB exceeds ${BUDGET.totalKB}KB`) : pass(`payload ${totalKB}KB`);

  const vid = cat(/\.(mp4|mov|webm)/i);
  vid > 50 ? fail(`${vid}KB of video fetched on load - the hero video should stay deferred`) : pass('hero video not fetched on load');
  await ctx.close();
}

// ------------------------------------------------- behaviour that has regressed before
console.log('\n=== BEHAVIOUR ===');
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForTimeout(1500);

  const atLoad = await page.evaluate(() => {
    const v = document.querySelector('video');
    return v ? { src: v.currentSrc || '', poster: !!v.poster } : null;
  });
  if (atLoad) {
    atLoad.src ? fail('video has a src at load - it should be attached on scroll') : pass('video src deferred at load');
    atLoad.poster ? pass('video has a poster') : fail('video has no poster');
  }

  // scroll through the laptop pin and confirm playback still starts
  const H = await page.evaluate(() => document.getElementById('auLaptopTrack')?.offsetHeight || 0);
  for (let i = 1; i <= 14; i++) { await page.evaluate((y) => window.scrollTo(0, y), Math.round(H * i / 14)); await page.waitForTimeout(420); }
  await page.waitForTimeout(2500);
  const played = await page.evaluate(() => { const v = document.querySelector('video');
    return v ? { ready: v.readyState, paused: v.paused, t: v.currentTime } : null; });
  if (played) (played.ready >= 3 && !played.paused && played.t > 0)
    ? pass('video loads and plays on scroll')
    : fail(`video did not play (readyState=${played.ready} paused=${played.paused})`);

  const misc = await page.evaluate(() => ({
    rail: !!document.getElementById('sideNav'),
    stt: getComputedStyle(document.getElementById('scrollToTopBtn') || document.body).position,
    note: (() => { const n = document.querySelector('.au-sticky-note'); return n ? getComputedStyle(n).touchAction : 'n/a'; })(),
    inputs: ['.au-form-input', '.au-row-num', '.au-cs-trigger'].map((s) => { const e = document.querySelector(s);
      return e ? { s, fs: parseFloat(getComputedStyle(e).fontSize) } : null; }).filter(Boolean),
    marquee: (() => { const t = document.querySelector('.marquee-track'); return t ? getComputedStyle(t).animationPlayState : 'n/a'; })(),
  }));
  misc.rail ? fail('proximity side rail present on mobile - should be removed') : pass('side rail absent on mobile');
  misc.stt === 'fixed' ? pass('scroll-to-top is position:fixed') : fail(`scroll-to-top is ${misc.stt}, expected fixed`);
  misc.note === 'pan-y' ? pass('sticky note allows vertical scroll (touch-action:pan-y)') : fail(`sticky note touch-action is ${misc.note}`);
  for (const i of misc.inputs) i.fs >= 16 ? pass(`${i.s} is ${i.fs}px (no iOS zoom)`) : fail(`${i.s} is ${i.fs}px - iOS will zoom on focus`);
  misc.marquee === 'paused' ? pass('marquee paused while off-screen') : console.log(`  ·  marquee state off-screen: ${misc.marquee}`);
  await ctx.close();
}

// ------------------------------------------------------- desktop must not regress
console.log('\n=== DESKTOP 1440px (must keep the full experience) ===');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)));
  await page.goto(`${BASE}/index.html`, { waitUntil: 'load', timeout: 120000 });
  await page.evaluate(() => window.scrollTo(0, 2500));
  await page.waitForTimeout(1600);
  const d = await page.evaluate(() => ({
    rail: !!document.getElementById('sideNav'),
    blur: getComputedStyle(document.querySelector('header')).backdropFilter,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  d.rail ? pass('side rail present on desktop') : fail('side rail missing on desktop');
  d.blur && d.blur !== 'none' ? pass('header keeps its frosted blur on desktop') : fail('header blur lost on desktop');
  d.overflow > 1 ? fail(`desktop horizontal overflow +${d.overflow}px`) : pass('no desktop overflow');
  errors.length ? fail(`desktop console errors: ${errors[0]}`) : pass('no desktop console errors');
  await ctx.close();
}

await browser.close();
server.close();

console.log('\n' + '='.repeat(64));
if (fails.length) {
  console.log(`FAILED - ${fails.length} issue(s):`);
  fails.forEach((f) => console.log('  - ' + f));
  process.exit(1);
}
console.log('ALL CHECKS PASSED');
