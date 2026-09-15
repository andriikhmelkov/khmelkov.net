# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Single-page personal website for khmelkov.net. Static HTML/CSS with no build step, no package manager, and no tests — the entire site is `index.html` plus `css/styles.css` and the images in `img/`.

## Development

Open `index.html` directly in a browser, or serve the directory (`python3 -m http.server 8000`) if you need same-origin behavior. There is nothing to build, lint, or test.

## Deployment

GitHub Pages serves the repo root from the `main` branch; `CNAME` pins the custom domain `khmelkov.net`. Pushing to `main` deploys — there is no staging environment, so verify rendering locally first.

## Architecture

`index.html` holds all content and structure in one file, organized as commented section blocks (`<!-- Navbar -->`, `<!-- Hero -->`, `<!-- Hobbies -->`, `<!-- End … -->`). Sections are anchored by `id` (`#about`, `#hobbies`, `#impact`) and linked from the navbar — adding a section means adding both the block and its nav entry.

All third-party assets load from CDNs via `<link>`/`<script>` tags in `index.html`: Bootstrap 5.0.2 (CSS + JS bundle), Google Fonts Montserrat, Material Icons Outlined, and Leaflet 1.9.3 CSS. Layout and components come from Bootstrap utility classes; `css/styles.css` is a small override layer only (icon sizing/alignment, card image heights, the `.icon-trigger` hover effect). Prefer Bootstrap utilities over new custom CSS.

Note that `css/styles.css` uses nested CSS (a nested `@media` and `&:hover` inside `.icon-trigger`), which requires a browser with native CSS nesting support.

## Known loose ends

- `index.html` loads `js/scripts.js`, but that file has never existed in the repo — the request 404s. Either create it or drop the `<script>` tag rather than assuming it is missing locally.
- Leaflet CSS is loaded but no map is rendered anywhere.
- `img/youtube.jpg` is referenced by the "Filming and Editing" card and is currently deleted in the working tree.
