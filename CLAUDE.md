# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page promotional website (in Italian) for **CenaLonga**, a one-night street dinner held on Via Indipendenza in Amandola (FM), Italy on **3 July 2026**. It is a static site — no build step, no framework, no package manager. Deployed to GitHub Pages at `https://tomthias.github.io/cenalonga/` (custom domain `cenalongamandola.com`).

## Running it

Open `index.html` directly, or serve the folder for correct relative paths and the Eventbrite widget:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000/
```

There are no tests, linters, or build commands. Editing the HTML/CSS/JS is the entire workflow; deploy by committing to `main`.

## Files

- **`index.html`** — the live homepage. This is the canonical page.
- **`prenota.html`** — standalone booking page hosting the Eventbrite Embedded Checkout (loaded inline via an iframe widget). The "Prenota" buttons point here only when bookings are open.
- **`styles.css`** — all styling, shared by both pages. Design tokens live in `:root` (palette derived from the event poster: navy/cream/gold; fonts Fraunces + Hanken Grotesk via Google Fonts).
- **`app.js`** — all interactivity, shared by both pages (IIFE, plain ES5-style vanilla JS, no dependencies).
- **`assets/`** — images and the logo SVG actually used by the site.
- **`CenaLonga.html`**, **`tweaks-panel.jsx`**, **`uploads/`** — **gitignored, not part of the published site.** `CenaLonga.html` is an older single-file draft; `tweaks-panel.jsx` is preview-only tooling; `uploads/` holds unreferenced duplicate images. Do not treat these as the source of truth — edit `index.html` instead.

## Booking state machine (app.js)

The booking UI is driven by a three-state machine computed from dates in the `CFG` object at the top of `app.js`:

- `before` — now < `openAt` (countdown to opening; CTA disabled)
- `open` — `openAt` ≤ now ≤ `closeAt` (CTA links to `prenota.html`)
- `closed` — now > `closeAt` (countdown to the dinner; CTA disabled)

`resolveState()` normally derives the state from the current time, **but** `window.__cenaOverride` forces it. Valid values: `'auto'` (use the real clock), `'before'`, `'open'`, `'closed'`.

> **Important:** `app.js` currently hardcodes `window.__cenaOverride = 'open'` as a preview override so the booking flow shows as active before the real opening date. To restore automatic date-driven behavior, set this back to `'auto'`. Check this value whenever booking-state behavior seems wrong.

`renderBooking()`, `renderHeaderCta()`, and `renderHeroPill()` all read the resolved state and rewrite DOM text/attributes/classes accordingly — the `.booking` element toggles between `is-before` / `is-open` / `is-closed`. Each state has its own headline, sub-copy, countdown target, CTA, and note, all defined inline in `renderBooking()`. A 1-second `setInterval(tick)` refreshes the countdowns; `window.__cenaRefresh()` re-renders everything on demand.

## Eventbrite integration

The event ID and fallback URL live in `CFG.eventbriteEventId` / `CFG.eventbriteUrl` in `app.js`, exposed to `prenota.html` via `window.__cenaEventbrite`. The inline script at the bottom of `prenota.html` loads Eventbrite's `eb_widgets.js` and mounts the checkout into `#eb-inline`; if no event ID is set it leaves the `#eb-fallback` message visible. To point at a different event, update `CFG` only — `prenota.html` reads from there.

## Conventions

- All user-facing copy is **Italian**. Match the existing warm, informal tone when editing text.
- The two HTML pages duplicate their header and footer markup — keep them in sync manually when changing nav links, contacts, or social URLs.
- `app.js` queries elements defensively (`if (!el) return`) so the same script runs on both pages even though each only has a subset of the elements.
- Section content (timeline, menu, FAQ, associations) is plain hardcoded HTML in `index.html` — edit it there directly.
