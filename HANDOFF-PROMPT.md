# Handoff prompt for a new chat

Paste everything below the line into a fresh Claude Code session.

---

I am working on the Wozku landing page at `/Users/biradhwaj/Desktop/landing page`.
Read `CLAUDE.md` and `README.md` first, then this brief.

## Hard rules

- **Never use em dashes or en dashes** anywhere, including commit messages.
  Rewrite the sentence instead. Check your output for `—`, `–`, `&mdash;`,
  `&ndash;` before finishing.
- `index.html` at the repo root **is the entire live site**. The `src/` folder is
  a dead React tree. Do not edit it, do not read it as truth.
- Never add `tsc -b` back to the build script.
- Work on the branch, never on `main`. Vercel auto-deploys each branch to its own
  preview URL.
- I am a designer acting as PM, not a developer. Explain plainly and handle git,
  build and deploy yourself.

## Where things stand

Branch: `hero-split-experiment`. This is the preview my CEO reviews. `main` is
production and is behind.

The page follows a copy doc my CEO wrote, `wozku-ads-landing-page-copy_2.md`.
**That file is not in the repo.** If you need to verify copy against it, ask me to
paste it again.

Current page order: hero, trust bar, video carousel, Without/With Wozku, how it
works, "They play" (Elastic + Sify), Red Hat proof, why it travels, attribution,
ROI calculator, simulation band, Commercials banner, Ask your own AI, FAQ, closing
CTA, thank-you view.

Testimonials and case studies were deliberately removed from this build.

## Recently completed (do not redo)

- Hero uses a wireframe layout: headline band, full-bleed hairline, then two
  columns. Left is copy plus the email capture. Right is the five figures as a
  **numbered vertical rail, 01 to 05**, one step per row.
- Red Hat section has three **placeholder photo frames** ("Add image 1" to 3),
  id `auRhFan`. Pile at rest, fan out on hover, plain vertical stack on phones.
- Commercials is a horizontal banner, `.au-comm-banner`.
- Mobile horizontal scroll was fixed via `overflow-x: clip` on `.au-ask`.
- Section eyebrows were removed except "Don't take our word for it" and
  "Live Event Footage".
- Red Hat logo SVG had no `viewBox`, which cropped the hat. Fixed.
- Sify's figures reuse the Red Hat funnel component.

## Outstanding, blocked on my CEO (Roy)

Source: Fathom call "Content Lock", 2026-08-19, recording_id `174775769`,
https://fathom.video/calls/791130870

1. **Red Hat booth photos** for the three placeholder frames. Roy is taking
   snapshots from the live event video.
2. **Elastic numbers**, to be set as a funnel like Sify's and Red Hat's.
3. **Real images for the how-it-works steps 1, 2 and 3**, replacing the current
   mocked UI. Roy wants a booth QR scan photo, a real LinkedIn post screenshot,
   and a leaderboard screenshot. His reasoning at [21:00]: "we have enough
   real-life story to showcase", animations are for companies that don't.
4. **Video comments** under each carousel video. This needs a backend, so it is
   not a front-end task.

To swap a placeholder for a real photo, put the file in `public/` and replace the
`<span class="au-rh-ph">` inside the figure with an `<img>`. Documented in README.

## Also outstanding

- "How it works" sits earlier than the CEO's doc puts it. His doc runs
  Before/After, then the proof sections, then How it works. The page explains the
  mechanism before showing the proof. **My call, not yet made.**
- The how-it-works section has an alignment problem Roy flagged at [05:38].
- Some copy on the page is not in the CEO's doc: "and that is the end of it" on
  the Without Wozku figure, a "Run your own numbers" button, a "Get the full
  breakdown" link, three bullets in the simulation band, and a FAQ sub-line.
- The calculator estimate note was kept, since Roy conceded to keeping it.
- `public/` holds roughly 30MB of unreferenced images, including four 7MB PNGs of
  unrelated stock art. Never fetched by the browser, but deployed every build.

## How to verify changes

Do not eyeball. There is a `vite preview` server on port 4287 serving `dist/`, so
**you must run `npm run build` before testing or you will measure a stale page.**

Use Playwright (already installed) to check at 390, 768 and 1440 widths:

- `document.documentElement.scrollWidth` vs viewport, and whether `window.scrollX`
  moves after `scrollTo(9999, 0)`. Horizontal scroll on mobile is a recurring bug.
- `pageerror` and console errors.
- Forms submit through to the thank-you view.
- Computed styles and bounding rects for any alignment claim.

**Watch CSS specificity.** This file has bitten us repeatedly: a descendant or
sibling selector written earlier can outrank a later media query and silently pin
a value. If a media query "does not apply", check specificity first.

## Style of work I want

Tell me plainly when something I ask for is a bad idea and why, then do what I
decide. Measure before claiming something is fixed. If an asset or a fact is
missing, say so rather than inventing a placeholder that looks finished.
