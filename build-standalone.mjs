/**
 * Produces a single self-contained HTML file for sharing.
 *
 *   npm run share
 *
 * The normal build output only works over HTTP: it references an external JS
 * bundle, the /logos/*.svg files, the Google Fonts stylesheet, and a handful of
 * photos on wozku.com. This script pulls all of it inline as data URIs so the
 * result can be emailed and opened straight from the filesystem - and, more
 * importantly, so the page makes ZERO network requests at runtime. Remote
 * photos were costing ~5s of load time; downscaling them to display size with
 * sips brings the whole page in well under a second.
 *
 * Downloads are cached in .assetcache/ so repeat runs are fast.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const dist = join(root, 'dist');
const cache = join(root, '.assetcache');
const OUT = join(root, 'wozku-preview.html');

if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html missing - run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(cache)) mkdirSync(cache);

const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

const MIME = { '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' };
const dataUri = (file, mime) => {
  const ext = file.slice(file.lastIndexOf('.')).toLowerCase();
  return `data:${mime || MIME[ext] || 'application/octet-stream'};base64,` + readFileSync(file).toString('base64');
};

const fetchCached = async (url, name) => {
  const f = join(cache, name);
  if (existsSync(f)) return f;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  writeFileSync(f, Buffer.from(await res.arrayBuffer()));
  return f;
};

/** Downscale a raster to its real display size - a 34px avatar does not need 136 KB. */
const shrink = (file, maxPx, quality = 70) => {
  if (!/\.(jpe?g|png)$/i.test(file)) return file;
  const out = file.replace(/(\.\w+)$/, `.opt$1`);
  if (existsSync(out)) return out;
  try {
    execFileSync('sips', ['-Z', String(maxPx), '-s', 'formatOptions', String(quality), file, '--out', out], { stdio: 'ignore' });
    return existsSync(out) ? out : file;
  } catch {
    return file;
  }
};

let html = readFileSync(join(dist, 'index.html'), 'utf8');
const kb = (n) => `${(n / 1024).toFixed(0)} KB`;

/* ---------- 1. JS bundle ----------
   NB: the replacement must be a function - a string replacement would
   interpret $&, $' and friends occurring inside the minified bundle. */
const scriptMatch = html.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
if (!scriptMatch) throw new Error('Could not find the module script tag in dist/index.html');
const bundle = readFileSync(join(dist, scriptMatch[1].replace(/^\.?\//, '')), 'utf8');
html = html.replace(scriptMatch[0], () => `<script type="module">\n${bundle}\n</script>`);
console.log(`bundle      ${kb(bundle.length)}`);

/* ---------- 2. Client logos ---------- */
const logoDir = join(root, 'public', 'logos');
const logoData = {};
for (const f of readdirSync(logoDir).filter((f) => f.endsWith('.svg'))) {
  logoData[f] = dataUri(join(logoDir, f));
}
html = html.replace('<head>', () => `<head>\n<script>window.__LOGO_DATA = ${JSON.stringify(logoData)};</script>`);
console.log(`logos       ${Object.keys(logoData).length} files`);

/* ---------- 3. Wordmark ---------- */
const mark = [join(root, 'src', 'assets', 'wozku_logo-black.svg'), join(root, 'public', 'wozku_logo-black.svg')].find(existsSync);
if (mark) {
  const uri = dataUri(mark);
  html = html
    .replace(/src="[^"]*wozku_logo-black[^"]*\.svg"/g, () => `src="${uri}"`)
    .replace(/this\.src='[^']*wozku_logo-black[^']*\.svg'/g, () => `this.src='${uri}'`);
  console.log('wordmark    inlined');
}

/* ---------- 4. Local rasters and loose SVGs ----------
   svg is in the match now as well: the file-type icons in the reality-check bento
   live in public/file-icons and are referenced straight from the markup, so
   without this they 404 in the offline build. shrink() passes non-raster files
   through untouched and MIME already knows image/svg+xml. */
for (const ref of new Set([...html.matchAll(/["'(]\.?\/?([\w./-]+\.(?:jpe?g|png|webp|svg))["')]/g)].map((m) => m[1]))) {
  const base = ref.split('/').pop();
  const src = [join(root, 'public', base), join(root, 'public', 'file-icons', base), join(root, 'public', 'avatars', base), join(dist, base), join(root, 'src', 'assets', base)].find(existsSync);
  if (!src) continue;
  // 400px is right for avatars and card thumbs, but the hero plate is a full-bleed
  // background stretched across the whole band - at 400px wide the upscale bands.
  const isHeroPlate = /hero-plate/i.test(base);
  html = html.split(ref).join(dataUri(shrink(src, isHeroPlate ? 1600 : 400, isHeroPlate ? 82 : 75)));
  console.log(`image       ${base}`);
}

/* ---------- 5. Remote photos on wozku.com ---------- */
let remoteBytes = 0;
for (const url of new Set([...html.matchAll(/https:\/\/wozku\.com\/[^"')\s]+/g)].map((m) => m[0]))) {
  const base = url.split('/').pop().replace(/[^\w.-]/g, '_');
  try {
    let f = await fetchCached(url, base);
    // headshots render at ~34px, case-study photos at ~420px
    f = /Ajit|chaitra|kush/i.test(base) ? shrink(f, 160, 72) : shrink(f, 700, 68);
    const buf = readFileSync(f);
    remoteBytes += buf.length;
    html = html.split(url).join(dataUri(f, base.endsWith('.svg') ? 'image/svg+xml' : undefined));
    console.log(`photo       ${base.padEnd(22)} ${kb(buf.length)}`);
  } catch (e) {
    console.warn(`photo       ${base} FAILED (${e.message}) - will still load remotely`);
  }
}
console.log(`            remote photos total ${kb(remoteBytes)}`);

/* ---------- 6. Webfonts ---------- */
const linkMatch = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"[^>]*>/);
if (linkMatch) try {
  // cache the stylesheet too, so a flaky network doesn't fail the whole build
  const cssFile = join(cache, 'fonts.css');
  if (!existsSync(cssFile)) {
    const r = await fetch(linkMatch[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`fonts stylesheet ${r.status}`);
    writeFileSync(cssFile, await r.text());
  }
  const css = readFileSync(cssFile, 'utf8');
  // English-only copy, so the latin subset alone covers every glyph the page
  // actually sets; latin-ext would double the font payload for nothing.
  const KEEP = new Set(['latin']);
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
    .filter((m) => KEEP.has(m[1]))
    .map((m) => m[2]);
  let fontBytes = 0;
  const faces = await Promise.all(
    blocks.map(async (block) => {
      const u = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
      if (!u) return block;
      const f = await fetchCached(u[1], u[1].split('/').slice(-2).join('_'));
      const buf = readFileSync(f);
      fontBytes += buf.length;
      return block.replace(u[1], () => `data:font/woff2;base64,${buf.toString('base64')}`);
    })
  );
  html = html
    .replace(/<link rel="preconnect"[^>]*>\s*/g, '')
    .replace(linkMatch[0], () => `<style>\n${faces.join('\n')}\n</style>`);
  console.log(`fonts       ${faces.length} faces, ${kb(fontBytes)}`);
} catch (e) {
  console.warn(`fonts       SKIPPED (${e.message}) - page will fetch them from Google at runtime.`);
  console.warn('            Re-run `npm run share` once you are back online for a fully offline file.');
}

/* ---------- 6b. Satoshi (Fontshare) ----------
   The Wozku brand body face is not on Google Fonts, so it has its own host and
   its own stylesheet shape. Fontshare emits no subset comments to filter on,
   just @font-face blocks pointing at cdn.fontshare.com - parse them directly. */
const fsMatch = html.match(/<link href="(https:\/\/api\.fontshare\.com\/v2\/css[^"]+)"[^>]*>/);
if (fsMatch) try {
  const fsFile = join(cache, 'fontshare.css');
  if (!existsSync(fsFile)) {
    const r = await fetch(fsMatch[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`fontshare stylesheet ${r.status}`);
    writeFileSync(fsFile, await r.text());
  }
  const css = readFileSync(fsFile, 'utf8');
  const blocks = [...css.matchAll(/@font-face\s*\{[^}]*\}/g)].map((m) => m[0]);
  if (!blocks.length) throw new Error('no @font-face blocks parsed');
  let fsBytes = 0;
  const faces = await Promise.all(
    blocks.map(async (block) => {
      // Fontshare emits protocol-relative, single-quoted urls:
      //   url('//cdn.fontshare.com/wf/.../ABC.woff2') format('woff2')
      const u = block.match(/url\(['"]?(?:https:)?\/\/cdn\.fontshare\.com\/([^'")]+\.woff2)['"]?\)/);
      if (!u) return null; // skip any block with no woff2 source
      const abs = `https://cdn.fontshare.com/${u[1]}`;
      const f = await fetchCached(abs, u[1].split('/').slice(-1)[0]);
      const buf = readFileSync(f);
      fsBytes += buf.length;
      // drop the sibling woff/ttf sources; the inlined woff2 is the only one we ship
      return block
        .replace(/src:[^;]+;/, `src: url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');`);
    })
  );
  const kept = faces.filter(Boolean);
  if (!kept.length) throw new Error('no woff2 sources found');
  html = html
    .replace(/<link rel="preconnect" href="https:\/\/api\.fontshare\.com"[^>]*>\s*/g, '')
    .replace(fsMatch[0], () => `<style>\n${kept.join('\n')}\n</style>`);
  console.log(`satoshi     ${kept.length} faces, ${kb(fsBytes)}`);
} catch (e) {
  console.warn(`satoshi     SKIPPED (${e.message}) - page will fetch Satoshi from Fontshare at runtime.`);
}

/* ---------- 7. Verify nothing external is left ---------- */
const external = [...new Set([...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).host))];
const absolute = [...new Set([...html.matchAll(/(?:src|href)="(\/(?!\/)[^"]*)"/g)].map((m) => m[1]))];
if (external.length) console.warn(`WARNING external hosts remain: ${external}`);
if (absolute.length) console.warn(`WARNING absolute paths remain: ${absolute}`);

writeFileSync(OUT, html);
console.log(`\nwrote wozku-preview.html  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
console.log(external.length ? 'Note: still makes some network requests.' : 'Zero network requests - works fully offline.');
