# Wozku landing page

## Writing rules (non-negotiable)

**Never use em dashes (—) or en dashes (–).** Not in page copy, not in commit
messages, not in docs, not in anything you generate for this project. This has
been asked for repeatedly. Rewrite the sentence instead:

- Split it into two sentences.
- Use a comma, a colon, or brackets.
- Use a middot (·) for inline separators in UI labels, which the page already does.

Before finishing any task that produced text, search your output for `—`, `–`,
`&mdash;` and `&ndash;` and remove them.

Other copy rules for this page:

- Plain language over marketing abstraction. Say "they scan a QR code and tap
  once", not "1-click sharing and gamification".
- Do not ship statistics without a source. Unsourced hard numbers read as
  invented and cost more trust than they buy.
- Keep the total page under roughly 500 words. It is a landing page for cold
  paid traffic with one job: capture an email for the playbook.

## Which file is the website

**`index.html` at the repo root is the live site.** All content edits go there.
It is a single self-contained file with inline CSS and JS.

**The `src/` folder is a stale, abandoned React version of this page.** Nothing
imports it and nothing deploys it. Do not edit it, and do not treat it as the
source of truth. It still contains old placeholder copy which is completely
different from what is live.

## Build and deploy

- Vercel is set to the Vite preset and runs `npm run build`.
- Vite uses root `index.html` as its entry, processes it, and writes `dist/`.
- The build script is `vite build`. It used to be `tsc -b && vite build`, which
  type-checked the unused `src/` tree and could fail a deploy over dead code.
  Do not add `tsc -b` back.

## Reviewing changes before they go live

Work on a branch, never directly on `main`. Vercel auto-deploys every branch to
its own shareable preview URL, so `main` stays live and untouched while a
preview is reviewed. Merge to `main` when approved.

## Context

The user is a designer acting as product manager, not a developer. Explain
things in plain language and avoid unexplained technical jargon. Handle git,
build, and deploy mechanics directly rather than handing over commands to run.
