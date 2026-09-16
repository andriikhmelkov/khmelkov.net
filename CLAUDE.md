# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page personal website for khmelkov.net. Static HTML/CSS/JS with no build step, no package manager, and no tests — the site is `index.html` and `404.html`, plus `css/styles.css`, `js/site.js`, and the images in `img/`.

## Development

Serve the directory (`python3 -m http.server 8000`) and open it in a browser; `404.html` uses root-relative paths, so it only renders correctly when served. There is nothing to build, lint, or test.

## Deployment

GitHub Pages serves the repo root from the `main` branch; `CNAME` pins the custom domain `khmelkov.net`. `_config.yml` keeps `CLAUDE.md` out of the Jekyll build. Pushing to `main` deploys — there is no staging environment, so verify rendering locally first.

## Architecture

`index.html` holds all content in commented section blocks (`<!-- Header -->`, `<!-- Hero -->`, `<!-- Career -->`, `<!-- Principles -->`, `<!-- Away from work -->`, `<!-- Contact -->`). Sections are anchored by `id` (`#career`, `#principles`, `#away`, `#contact`) and linked from the header nav — adding a section means adding both the block and its nav entry.

No CSS framework. `css/styles.css` is the whole design system: color and type tokens on `:root` (with a `prefers-color-scheme: dark` override), then layout and components. The only third-party asset is Google Fonts (Archivo for headings/UI, Source Serif 4 for reading text).

The career section is a geological cross-section: `.strata` list items are ordered surface (current role) to bedrock (first role), each colored by `--layer-N` tokens with a jagged top edge from `clip-path`. A scroll-driven animation (`animation-timeline`, behind `@supports` and reduced-motion checks) settles the layers together.

The "Away from work" section contains `.reel`, a full-bleed photo strip. Its base styles are a swipeable, snapping row of square photos. Inside `@supports (animation-timeline: view())` and a reduced-motion guard, it becomes a sticky stage where the fifteen `.reel-item` cards are absolutely positioned and dealt from one pile to the other: each card has its own `animation-range` slice of the section's `--reel` view timeline, and per-card `--rot-*`/`--z-*` custom properties feed the shared `deal` keyframes. Piles sit left/right, or top/bottom under 700px. Adding or removing a photo means adding or removing an `:nth-child` rule with its range slice.

`js/site.js` adds optional extras on top of a page that works without it:
- Species hunt: `.critter` buttons hidden around the page (`data-species`, `data-name`, `data-note`); progress persists in `localStorage` and shows in the `#field-log` panel. Adding a critter updates the count automatically.
- Core samples: clicking a `.stratum` toggles its hidden `.core-sample` line.
- Terminal: `~` or `` ` `` (or `[data-open-terminal]`) opens the `#terminal` dialog; commands live in the `commands` object.
- Antarctica mode: Konami code or the terminal's `snow` command toggles falling snow and a waddling penguin.

## Content rules

Career facts must come from the user. The public timeline starts at system administrator. Easter egg copy can joke, but must not invent facts about the user's life.

## Known loose ends

- `img/insta.jpg`, `img/lightroom.jpg`, and `img/youtube.jpg` are unreferenced screenshots left over from the old design and can be deleted.
- The `img/reel-*.webp` photos carry descriptive alt text rather than place names, because the locations were never confirmed.
- `img/andrii-960.jpg` is only 960×577, so the tall hero crop looks soft on high-DPI screens.
