/**
 * Produces an artifact-ready HTML fragment from wozku-preview.html.
 *
 * Published artifact pages run under a strict CSP that blocks every external
 * host, so the Google Fonts stylesheet and the wozku.com headshots have to be
 * inlined as data URIs or they silently fail. The publish wrapper also supplies
 * its own <!doctype>/<html>/<head>/<body>, so those tags are stripped here.
 *
 *   npm run share && node build-artifact.mjs
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const SRC = join(root, 'wozku-preview.html');
const OUT = join(root, 'wozku-artifact.html');

if (!existsSync(SRC)) {
  console.error('wozku-preview.html missing - run `npm run share` first.');
  process.exit(1);
}

// A modern UA is required or Google Fonts serves ttf instead of woff2
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

let html = readFileSync(SRC, 'utf8');

/* ---------- 1. Inline the webfonts ----------
   This reads wozku-preview.html, which build-standalone.mjs has usually already
   processed - and that step replaces the Google Fonts <link> with an inline
   <style>. So a missing <link> is the NORMAL case, not an error: it means the
   faces are already data URIs. Only fetch when the link actually survived
   (i.e. build-standalone ran offline and skipped its font step). */
const linkMatch = html.match(/<link href="(https:\/\/fonts\.googleapis\.com\/css2[^"]+)"[^>]*>/);
if (!linkMatch) {
  console.log('inlined fonts     already inlined by build-standalone - skipping');
} else {
  const cssUrl = linkMatch[1].replace(/&amp;/g, '&');
  const css = await (await fetch(cssUrl, { headers: { 'User-Agent': UA } })).text();

  // Keep only the latin subsets; the rest would multiply size for no benefit here
  const KEEP = new Set(['latin', 'latin-ext']);
  const blocks = [...css.matchAll(/\/\*\s*([\w-]+)\s*\*\/\s*(@font-face\s*\{[^}]*\})/g)]
    .filter((m) => KEEP.has(m[1]))
    .map((m) => m[2]);

  let bytes = 0;
  const inlined = await Promise.all(
    blocks.map(async (block) => {
      const u = block.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
      if (!u) return block;
      const buf = Buffer.from(await (await fetch(u[1])).arrayBuffer());
      bytes += buf.length;
      const uri = `data:font/woff2;base64,${buf.toString('base64')}`;
      return block.replace(u[1], () => uri);
    })
  );
  console.log(`inlined fonts     ${inlined.length} faces, ${(bytes / 1024).toFixed(0)} KB`);
  html = html.replace(linkMatch[0], () => `<style>\n${inlined.join('\n')}\n</style>`);
}
html = html.replace(/<link rel="preconnect"[^>]*>\s*/g, '');

/* ---------- 1b. Inline Satoshi (Fontshare) ----------
   The brand body face is not on Google Fonts. Under the artifact CSP any
   surviving external font request is simply blocked, so this must be inlined
   or the page silently falls back to Inter/system. */
const fsMatch = html.match(/<link href="(https:\/\/api\.fontshare\.com\/v2\/css[^"]+)"[^>]*>/);
if (!fsMatch) {
  // Same as above: normally already inlined upstream by build-standalone.
  console.log('inlined satoshi   already inlined by build-standalone - skipping');
} else {
  const fsCss = await (await fetch(fsMatch[1].replace(/&amp;/g, '&'), { headers: { 'User-Agent': UA } })).text();
  let fsBytes = 0;
  const fsFaces = (await Promise.all(
    [...fsCss.matchAll(/@font-face\s*\{[^}]*\}/g)].map(async (m) => {
      // Fontshare urls are protocol-relative and single-quoted; add the scheme.
      const u = m[0].match(/url\(['"]?(?:https:)?\/\/cdn\.fontshare\.com\/([^'")]+\.woff2)['"]?\)/);
      if (!u) return null;
      const buf = Buffer.from(await (await fetch(`https://cdn.fontshare.com/${u[1]}`)).arrayBuffer());
      fsBytes += buf.length;
      return m[0].replace(/src:[^;]+;/, `src: url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2');`);
    })
  )).filter(Boolean);
  if (!fsFaces.length) throw new Error('Satoshi: no woff2 sources parsed from Fontshare CSS');
  console.log(`inlined satoshi   ${fsFaces.length} faces, ${(fsBytes / 1024).toFixed(0)} KB`);
  html = html.replace(fsMatch[0], () => `<style>\n${fsFaces.join('\n')}\n</style>`);
}

/* ---------- 2. Inline the remote headshots ---------- */
const remotes = [...new Set([...html.matchAll(/https:\/\/wozku\.com\/[^"')\s]+/g)].map((m) => m[0]))];
for (const url of remotes) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!res.ok) { console.warn(`  skipped (${res.status}) ${url}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const type = res.headers.get('content-type')?.split(';')[0] || 'image/jpeg';
    html = html.split(url).join(`data:${type};base64,${buf.toString('base64')}`);
    console.log(`inlined headshot  ${url.split('/').pop()} (${(buf.length / 1024).toFixed(0)} KB)`);
  } catch (e) {
    console.warn(`  failed ${url}: ${e.message}`);
  }
}

/* ---------- 3. Strip the wrapper tags the publisher supplies ---------- */
html = html
  .replace(/<!DOCTYPE[^>]*>/i, '')
  .replace(/<\/?html[^>]*>/gi, '')
  .replace(/<\/?head[^>]*>/gi, '')
  .replace(/<\/?body[^>]*>/gi, '')
  .replace(/<meta charset[^>]*>/i, '')
  .replace(/<meta name="viewport"[^>]*>/i, '')
  .trim();

/* ---------- 4. Confirm nothing external is left ---------- */
const external = [...new Set(
  [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => new URL(m[1]).host)
)];
console.log(external.length ? `WARNING external hosts remain: ${external}` : 'no external requests remain');

writeFileSync(OUT, html);
console.log(`\nwrote wozku-artifact.html  ${(html.length / 1024 / 1024).toFixed(2)} MB`);
