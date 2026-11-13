# Miracle Green: landing page

Landing page for **Miracle Green Lawn Service & Junk Removal** (Merced, CA).
Static site with no build step: `index.html`, `styles.css`, `main.js` and `img/`.

## Run locally
Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080
```

## Highlights
- Interactive hero: a canvas of grass that sways in the wind and bends away from the cursor
- "Scroll to mow" section that turns a dry lawn green in mowing stripes as you scroll
- Filterable service bento grid, gallery with lightbox, animated service-area map
- Quote form that opens a pre-filled text message to (209) 513-2736
- WebP images in responsive sizes, LocalBusiness JSON-LD, honors `prefers-reduced-motion`

## Editing contact details
Phone: search for `2095132736`. Email: search for `mailto:`.

## Trial notice (DGP Global Group)
`assets/dgp-trial.js` shows a fixed preview bar with a countdown. It is loaded just
before `</body>` in `index.html` with `data-expires="2026-11-20T23:59:59-08:00"`
(end of day in Merced, CA) and `data-site="Miracle Green"`.

The bar publishes its height in `--dgp-trial-h`; the header, progress bar, skip
link, hero padding, `scroll-padding-top` and the sticky "scroll to mow" stage use it.
When the client activates the site, delete that `<script>` tag and the file. The
`var(--dgp-trial-h, 0px)` fallbacks then resolve to zero, so nothing else changes.
