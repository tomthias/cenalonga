# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page promotional website (in Italian) for **CenaLonga**, a one-night street dinner held on Via Indipendenza in Amandola (FM), Italy on **3 July 2026**. It is a static site — no build step, no framework, no package manager. Deployed to GitHub Pages at `https://tomthias.github.io/cenalonga/` (custom domain `cenalongamandola.com`).

## Running it

Open `index.html` directly, or serve the folder for correct relative paths (fonts, the Eventbrite widget):

```bash
python3 -m http.server 8000   # then visit http://localhost:8000/
```

There are no tests, linters, or build commands. Editing the HTML/CSS/JS is the entire workflow; deploy by committing to `main`.

## Files

- **`index.html`** — the live homepage. This is the canonical page; it also contains the booking **modal** (`#book-modal`) at the bottom.
- **`privacy.html`** — privacy & cookie informativa (Italian). Reuses `styles.css`, `app.js`, and the shared header/footer.
- **`styles.css`** — all styling, shared by every page. Design tokens live in `:root` (palette derived from the event poster: navy/cream/gold).
- **`app.js`** — all interactivity, shared by every page (IIFE, plain ES5-style vanilla JS, no dependencies).
- **`assets/`** — images and the logo SVG. **`assets/fonts/`** holds the self-hosted woff2 files (see Fonts below).
- **`CenaLonga.html`**, **`tweaks-panel.jsx`**, **`uploads/`** — **gitignored, not part of the published site.** `CenaLonga.html` is an older single-file draft; `tweaks-panel.jsx` is preview-only tooling; `uploads/` holds unreferenced duplicate images. Do not treat these as the source of truth — edit `index.html` instead.

> Note: `prenota.html` no longer exists — it was replaced by the in-page booking modal. Don't recreate it; wire booking changes through the modal in `index.html` + `app.js`.

## Fonts (self-hosted)

Fraunces (serif) and Hanken Grotesk (sans) are **self-hosted** from `assets/fonts/`, declared via `@font-face` at the top of `styles.css` — there is **no** Google Fonts `@import` or CDN call (a deliberate privacy choice: no IP transfer to Google). Both are variable fonts; only the `latin` + `latin-ext` subsets are shipped (enough for Italian). `index.html` and `privacy.html` `<link rel="preload">` the two primary faces. If you change weights/styles, update the `@font-face` blocks and re-download the matching woff2 — don't reintroduce the CDN import.

## Booking state machine (app.js)

The booking UI is driven by a three-state machine computed from dates in the `CFG` object at the top of `app.js`:

- `before` — now < `openAt` (countdown to opening; CTA disabled)
- `open` — `openAt` ≤ now ≤ `closeAt` (CTA opens the booking modal)
- `closed` — now > `closeAt` (countdown to the dinner; CTA disabled)

`resolveState()` normally derives the state from the current time, **but** `window.__cenaOverride` forces it. Valid values: `'auto'` (use the real clock), `'before'`, `'open'`, `'closed'`.

> **Important:** `app.js` currently hardcodes `window.__cenaOverride = 'open'` as a preview override so the booking flow shows as active before the real opening date. To restore automatic date-driven behavior, set this back to `'auto'`. Check this value whenever booking-state behavior seems wrong.

`renderBooking()`, `renderHeaderCta()`, and `renderHeroPill()` all read the resolved state and rewrite DOM text/attributes/classes accordingly — the `.booking` element toggles between `is-before` / `is-open` / `is-closed`. Each state has its own headline, sub-copy, countdown target, CTA, and note, all defined inline in `renderBooking()`. A 1-second `setInterval(tick)` refreshes the countdowns; `window.__cenaRefresh()` re-renders everything on demand.

## Eventbrite integration (booking modal)

The event ID and fallback URL live in `CFG.eventbriteEventId` / `CFG.eventbriteUrl` in `app.js`. Clicking any `.js-book` button (header CTA, hero CTA, the `#b-cta` in the booking section) opens `#book-modal` — but only when `resolveState() === 'open'`; otherwise the default link behavior is left intact. The modal's `loadWidget()` injects Eventbrite's `eb_widgets.js` and mounts the checkout into `#eb-inline` **lazily, on first open only**; if no event ID is set it leaves the `#eb-fallback` message visible. To point at a different event, update `CFG` only.

This lazy-on-click loading is also the privacy mechanism: Eventbrite (the only third-party embed) is not contacted until the user actively opens the booking modal, so no third-party cookies are set on page load. See Privacy below before changing it.

## Privacy & cookie

The site is intentionally low-footprint: no analytics, no first-party/profiling cookies, fonts self-hosted, social links are plain `<a>`. The only third-party is the Eventbrite checkout, gated behind the click-to-open modal. `privacy.html` documents all this; the modal carries a `.book-modal-note` linking to it. **If you add analytics, an auto-loading embed, or any always-on third-party script, that breaks the "no consent banner needed" assumption** — you'd then need a real cookie-consent gate. Keep new third-party scripts behind an explicit user action.

## Conventions

- All user-facing copy is **Italian**. Match the existing warm, informal tone when editing text.
- The HTML pages duplicate their header and footer markup — keep them in sync manually when changing nav links, contacts, or social URLs.
- `app.js` queries elements defensively (`if (!el) return`, and `#book-modal` returns no-op handlers when absent) so the same script runs on every page even though each only has a subset of the elements.
- Section content (timeline, menu, FAQ, associations) is plain hardcoded HTML in `index.html` — edit it there directly.
