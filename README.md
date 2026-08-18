# Wozku Landing Page

Premium marketing landing page for Wozku, built with Vite, React, TypeScript, Tailwind CSS, and Framer Motion.

## Getting started

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (typically `http://localhost:5173`).

## Scripts

- `npm run dev` - start the development server
- `npm run build` - type-check and build for production
- `npm run preview` - preview the production build locally

## Project structure

```
src/
  components/
    sections/     # Page sections (Hero, ROI, etc.)
    ui/             # Reusable UI primitives
  data/             # Mock/demo content
  utils/            # ROI logic and formatters
  App.tsx
  main.tsx
```

## Sections

1. Hero
2. Sponsors
3. Case Studies
4. ROI Calculator
5. Testimonials

The ROI calculator logic lives in `src/utils/roiCalculator.ts`, separate from the presentation layer.

## Content

All sponsors, case studies, metrics, and testimonials are demo placeholders. Replace the data files in `src/data/` when real content is available.

## Note on prototype

If you have a `landing.html` visual prototype, drop it in the project root for reference. The current implementation follows the Wozku brand system and the landing-page specification.
