# Wozku Landing Page - Developer Handoff Guide

A high-performance single-page marketing application designed for cold paid traffic and organic conversion. One core objective: capture a work email in exchange for the playbook or event demo.

---

## 1. Project Architecture

- **`index.html`** at the repo root is the primary application file containing the page structure, inline CSS design tokens, responsive layout rules, WebGL background shaders, and interactive behaviors.
- **`public/`** contains all production assets:
  - `/fonts/`: Self-hosted webfonts (Satoshi, JetBrains Mono, Space Grotesk, Instrument Serif, Shadows Into Light, Caveat)
  - `/video/`: 5 high-efficiency MP4 video walkthroughs with posters
  - `/logos/`: Vector partner and customer brand logos
  - `/avatars/`: Verified executive spotlight headshots
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

## 4. House Rules

- **No em dashes (—) or en dashes (–)** anywhere in copy or documentation. Use standard hyphens (-), colons (:), brackets, or middots (·).
- **Self-contained performance**: All fonts, SVGs, and posters are locally hosted in `public/` to maintain 0 third-party network blocking.
