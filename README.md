# Wozku landing page

A single-page marketing site for cold paid traffic. One job: capture a work email
in exchange for the playbook.

This document is written for a developer taking the project over. It says what
the repo actually is, what is already finished, and exactly where a backend has
to be wired in.

## The one thing to know first

**`index.html` at the repo root is the entire live site.** It is one
self-contained file: markup, an inline `<style>` block, and an inline `<script>`
block. There is no component framework, no CSS preprocessor, and no client
router. Every content and design change goes in that file.

**The `src/` folder is a stale, abandoned React version of this page.** Nothing
imports it, nothing deploys it, and its copy is unrelated to what is live. Treat
it as dead code. It is only still present because deleting it has not been
approved yet. See "Suggested cleanup" at the bottom.

## Running it

```bash
npm install
npm run dev      # vite dev server
npm run build    # writes dist/
npm run preview  # serves dist/ locally
```

## Build and deploy

- Hosted on Vercel, Vite preset, build command `npm run build`.
- Vite treats root `index.html` as its entry, processes it, and writes `dist/`.
- The build script is `vite build`. It used to be `tsc -b && vite build`, which
  type-checked the dead `src/` tree and could fail a deploy over code that is
  never shipped. **Do not add `tsc -b` back.**
- Vercel auto-deploys every branch to its own preview URL. `main` is production.
  Work on a branch, review the preview, then merge.

## What still needs a backend

Everything below is built, validated, and animated on the client. None of it
sends data anywhere yet. Each hook point is marked in `index.html` with a
`// TODO(backend):` comment, so `grep -n "TODO(backend)" index.html` gives you
the full list in seconds.

### 1. Email capture (three forms, one behaviour)

All three run through the same helper, `wireCaptureForm(formId, inputId, errId)`.
It validates against `EMAIL_RE`, writes an inline error message on failure, and
on success calls `showThankYou()`.

| Form | Form id | Input id | Error id | Where it sits |
|---|---|---|---|---|
| Hero | `auHeroForm` | `auHeroEmail` | `auHeroErr` | Hero, right under the headline |
| Red Hat proof | `auRedhatForm` | `auRedhatEmail` | `auRedhatErr` | Under the Red Hat funnel |
| Closing CTA | `auCtaForm` | `auCtaEmail` | `auCtaErr` | Bottom of the page |

Wire the POST inside `wireCaptureForm`, at the `TODO(backend)` line, and it
covers all three at once. Suggested contract:

```
POST /api/lead
{ "email": "...", "source": "hero" | "redhat" | "cta" }
```

Send `source` so marketing can tell which section converts. The three call sites
are the three `wireCaptureForm(...)` lines directly below the function.

### 2. Playbook delivery

Right now `showThankYou()` swaps `#mainView` for `#auThankYou`, which says "The
playbook is on its way to your inbox." **No email is sent and no file exists.**

Two decisions to make with marketing:

- Email delivery (matches the current copy), or an immediate download link on the
  thank-you view. If you add a download, the copy on `.au-ty-h1` has to change.
- Where the PDF lives. `public/playbook-cover.opt.jpg` is only the cover artwork
  shown next to the CTA. The playbook itself is not in this repo.

### 3. Dedicated simulation request

A separate, larger form under the ROI calculator. Its own handler,
`wireSimForm()`.

- Form id `auSimForm`, fields `auSimName`, `auSimEmail`, plus optional phone and
  event fields, error target `auSimErr`.
- Name and email are required and validated client side; the other two are not.
- On success it also calls `showThankYou()`.

```
POST /api/simulation-request
{ "name": "...", "email": "...", "phone": "...", "event": "..." }
```

### 4. Booking calendar

`initBookingCalendar()` renders a working Cal.com-style month grid and time
slots on the thank-you view. It is **presentational only**:

- Slots are hardcoded arrays, `TIME_SLOTS_AM` and `TIME_SLOTS_PM`. Nothing checks
  real availability, so it will happily offer a slot that is already booked.
- The confirm button, `#auCalConfirm`, only swaps `#auCalPicker` for `#auCalDone`
  and fires confetti. No booking is created.
- The timezone label is read from `Intl.DateTimeFormat().resolvedOptions()` and
  is display only. It is not applied to the slot times.

Two realistic options: replace the whole widget with an embedded Cal.com or
Calendly script, or keep the custom UI and back it with a real availability
endpoint plus a create-booking endpoint. The second keeps the design; it is more
work.

### 5. ROI calculator

Pure client-side arithmetic in the inline script. No backend needed unless you
want to log what people modelled.

## Notable implementation details

Things that will look like bugs but are deliberate. All of them carry an
explanatory comment at the relevant CSS rule.

- **Hero background geometry is computed in JS.** `heroBandGeometry()` measures
  the hero's horizontal divider and writes `--hero-band` and `--hero-fade-top`.
  A WebGL shader reads those custom properties. If you change hero markup above
  the divider, re-check that function.
- **`.au-form-input` is deliberately borderless**, because it normally lives
  inside `.au-form-bar`, which draws the border. Using it standalone renders an
  invisible field.
- **`.au-ask` uses `overflow-x: clip`, not `hidden`.** Its background glow is
  256% wide on phones and used to make the whole document scroll sideways.
  `hidden` on one axis forces the other into a scroll container, which cuts the
  glow off vertically and creates a seam.
- **`.vc-viewport` sets `box-sizing: content-box`** against the page-wide
  border-box rule, because the script sets its height directly.
- **Watch CSS specificity.** This file has bitten us repeatedly: a descendant or
  sibling selector written earlier can outrank a later media query and silently
  pin a value. If a media query "does not apply", check specificity before
  anything else.

## House copy rules

Documented in full in `CLAUDE.md`. The short version:

- **No em dashes or en dashes anywhere**, including commit messages. Rewrite the
  sentence, or use a comma, colon, brackets, or a middot for UI separators.
- Plain language over marketing abstraction.
- No statistics without a source.

## Suggested cleanup (not done, needs sign-off)

- **Delete `src/`** and the TypeScript config files that only serve it. Nothing
  references them.
- **`public/` carries roughly 30MB of unreferenced images**, including four PNGs
  of about 7MB each. They are never requested by the browser, so they do not
  affect load time, but they are deployed on every build and bloat the repo.
  Referenced assets are only: `/frames/browser.svg`, `/frames/iphone.svg`,
  `/playbook-cover.opt.jpg`, `/redhat-logo.svg`,
  `/src/assets/wozku_logo-black.svg`, and the five files in `/video/`.
- `video-originals/` is camera masters, gitignored, never deployed.

## Current performance

Measured on the production build, mobile viewport, throttled to slow 4G with a
4x CPU slowdown:

- First Contentful Paint 0.77s
- Largest Contentful Paint 1.26s
- 0.27MB and 32 requests on initial load

Videos are lazy: only one is fetched on load, the rest on interaction. Keep it
that way.
