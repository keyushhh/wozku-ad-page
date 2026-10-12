# Wozku Landing Page - Developer Handoff Guide

A high-performance single-page marketing application designed for cold paid traffic and organic conversion. One core objective: capture a work email in exchange for the playbook or event demo.

---

## 1. Project Architecture

- **`index.html`** at the repo root holds the page structure, WebGL background shaders, and interactive behaviors.
- **`src/styles.css`** holds all styles: design tokens, layout, and responsive rules. It is a normal stylesheet in `npm run dev`; `npm run build` minifies it and inlines it into `dist/index.html` (see `vite.config.js`). Inline measured ~200ms faster LCP than an external render-blocking stylesheet for first-time mobile visitors, which is nearly all of this page's paid traffic.
- **`src/hero-plate-emerald-900.webp`** is the 7 KB mobile hero background, inlined into the CSS at build so it paints with the first frame (no extra request).
- **`public/`** contains all production assets:
  - `/fonts/`: Self-hosted webfonts (Satoshi, Space Grotesk, JetBrains Mono, Instrument Serif)
  - `/video/`: 5 high-efficiency MP4 video walkthroughs with posters
  - `/logos/`: Vector partner and customer brand logos
  - `/frames/`: Browser and iPhone SVG frame wrappers

---

## 2. Quick Start & Development

```bash
# Install dependencies
npm install

# Start local dev server (Vite)
npm run dev

# Build production bundle to dist/
npm run build

# Preview production build locally
npm run preview

# Generate clean dev handoff zip package
npm run export-zip
```

---

## 3. Backend Integration Points

All UI forms, animations, and input validations are complete on the client side. The backend endpoints to wire in are annotated in `index.html` with `// TODO(backend):` markers. Run `grep -n "TODO(backend)" index.html` to view each line directly.

### A. Email Lead Capture (3 forms, unified handler)
Hero form (`#auHeroForm`), Red Hat proof form (`#auRedhatForm`), and Bottom CTA form (`#auCtaForm`) all route through `wireCaptureForm(formId, inputId, errId)`.

- **Suggested Endpoint**: `POST /api/lead`
- **Payload**:
  ```json
  {
    "email": "user@company.com",
    "source": "hero" // or "redhat" or "cta"
  }
  ```

### B. Simulation Request Form
The dedicated event simulation request under the ROI Calculator (`#auSimForm`) routes through `wireSimForm()`.

- **Suggested Endpoint**: `POST /api/simulation-request`
- **Payload**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane@enterprise.com",
    "phone": "+1 ...",
    "event": "AWS re:Invent"
  }
  ```

### C. Booking Calendar (`#auCalendar`)
`initBookingCalendar()` provides an interactive Cal.com-style calendar widget on the thank-you screen. It can be wired to your live Cal.com / Calendly booking API or custom scheduling endpoint.

### D. Playbook PDF Delivery
On successful lead capture, `showThankYou()` presents the confirmation screen. Wire your email automation (e.g. Loops, Resend, HubSpot) to trigger the playbook PDF delivery workflow.

---

## 4. Production Performance Checklist

Mobile Core Web Vitals (CrUX, Sep 2026): LCP 3.2s, FCP 3.0s, TTFB 1.9s. Most of that comes from how `wozku.com/fmp` is served, not from this page. Please keep these when porting:

1. **Ship the markup in the HTML response.** Production currently returns an empty `<div id="root">` and injects the whole page from `fmp.js` via `innerHTML`, so nothing paints until the JS downloads and runs. Put the `<body>` markup from `index.html` directly in the Blade view and let the JS only attach behavior.
2. **Make the `/fmp` HTML cacheable at the edge.** It currently returns `cache-control: no-cache, private` and `cf-cache-status: DYNAMIC` (Laravel session + CSRF on a static page). Serve the route without session middleware, exempt the lead endpoints from CSRF (or fetch the token on submit), and add a Cloudflare "Cache Everything" rule with purge on deploy.
3. **Deploy the `npm run build` output as-is.** `dist/index.html` already has the minified CSS and the mobile hero image inlined, with the JS in a separate hashed file under `dist/assets/`. Do not paste the JS inline into the HTML: it is not render-blocking, and as a separate file it caches across visits. Keep the `<head>` hints (desktop hero preload, two h1 font preloads); if assets stay on `cdn.wozku.com`, keep `<link rel="preconnect" href="https://cdn.wozku.com" crossorigin>` first.
4. **Remove the `/fmp` to `/fmp/` redirect.** The 301 adds a full round trip before any HTML. Serve both paths directly, or point every ad and link at the final URL.
5. **Set long cache headers on CDN assets.** `cdn.wozku.com` (S3/CloudFront) sends no `Cache-Control`. Use `public, max-age=31536000, immutable` with versioned filenames.
6. **Load Facebook Pixel and gtag after `load`**, not inline in `<head>`.
7. **Do not re-add Google Fonts / Fontshare stylesheets.** All fonts are self-hosted with `@font-face` and metric-matched fallbacks.

---

## 5. House Rules

- **No em dashes (—) or en dashes (–)** anywhere in copy or documentation. Use standard hyphens (-), colons (:), brackets, or middots (·).
- **Self-contained performance**: All fonts, SVGs, and posters are locally hosted in `public/` to maintain 0 third-party network blocking.
