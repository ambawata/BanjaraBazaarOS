---
name: icon-library-style
description: Locked style recipe for the BanjaraBazaarOS Design Asset Library "Track A" icon set (Navigation, Rooms, Utilities, site-scale Structure, Vastu symbolic/diagram icons). Use this when adding, editing, or regenerating any icon in assets/icons/ so new icons stay pixel-consistent with the existing ~130 without re-deriving the style from scratch.
---

# Icon Library Style — Track A

Track A covers **simple, code-generated SVG icons** — functional UI icons and
Vastu diagram symbols. It is explicitly separate from Track B (rich
painterly furniture/appliance/decor illustrations, generated externally via
an image model) — never try to make a Track A icon look painterly, and
never hand-illustrate something that belongs in Track A.

## Where things live

```
assets/icons/
  generate.js              shared constants + drawing helpers (palette, svgWrap, compassZone, grid, badgeShell, roomShell)
  data-navigation.js        20 items, sub-style 1
  data-utilities.js         30 items, sub-style 1
  data-rooms.js              35 items, sub-style 2
  data-structure-site.js     6 items, sub-style 2
  data-vastu-symbolic.js    39 items, sub-style 2
  build.js                  writes every SVG file + regenerates gallery.html
  gallery.html              generated — do not hand-edit, re-run build.js instead
  navigation/*.svg, rooms/*.svg, utilities/*.svg, structure-site/*.svg, vastu-symbolic/*.svg
```

**To add or change an icon**: edit the relevant `data-*.js` array (each
entry is `['Display Name', () => '<svg-inner-markup>']`), then run:

```bash
node assets/icons/build.js
```

This regenerates every `.svg` file and `gallery.html` from scratch — it's
idempotent, safe to re-run any time.

## Locked palette

| Token | Hex | Use |
|---|---|---|
| Purple (primary) | `#5A1FB3` | every icon's stroke/fill by default — this is the *only* color most icons use |
| Amber | `#D97706` | Warning Badge only — semantic status, not decorative |
| Red | `#DC2626` | Critical Badge, and the "avoid" dots in Vastu zone diagrams |

Never introduce a new color without a semantic reason (status/warning), and
never use amber/red for a purely decorative accent — that's what makes
Warning/Critical actually read as warnings.

## Two sub-styles — which one to use

**Sub-style 1 — UI icons** (`navigation/`, `utilities/`):
- `viewBox="0 0 48 48"`
- 2px stroke, `stroke-linecap="round"`, `stroke-linejoin="round"`, `fill="none"` by default
- Minimal — one clear metaphor per icon, no decorative flourishes
- Use for: anything that's a functional app UI control or a physical
  utility fixture (meters, tanks, sensors)

**Sub-style 2 — Room labels + Vastu diagrams** (`rooms/`, `structure-site/`,
`vastu-symbolic/`):
- `viewBox="0 0 64 64"`
- Same 2px purple monoline, but allowed more detail: geometric diagram
  elements (grids, compass roses, zone-shading) where the concept actually
  needs one
- Room icons share a common outline shell (`roomShell()` in `generate.js`)
  with a distinct furniture/function glyph inside — this is what makes 35
  room icons read as one family instead of 35 unrelated drawings
- Badge-style items (Excellent/Good/Warning/Critical/AI Suggestion/
  Compliance Seal/Vastu Score) use `badgeShell()` — a consistent circle/dial
  shell with a distinguishing glyph inside (check, triangle, X, sparkle,
  ribbon, gauge respectively)

## Vastu diagram accuracy — don't guess, cross-reference the KB

Any icon that claims a specific direction is "best" or "avoid" (every
`…Zone` icon, `Underground Tank`, `Overhead Tank`) must pull that data from
`knowledge-base/vastu_kb_enriched.json`, not be invented. Pattern used in
`data-vastu-symbolic.js`'s `ZONE` object — look up the entry by its
`category`/`topic`, take its `best`/`avoid` (or `raw.matrix.<room>` for
`RZ-01`-style nested entries), and pass it straight into `compassZone()`.
If a new zone icon is needed later, find the matching KB entry first — see
the comment block above the `ZONE` object in `data-vastu-symbolic.js` for
which entry backs which icon.

`compassZone(cx, cy, r, best, avoid)` plots all 8 standard compass points;
qualifiers the KB sometimes attaches (e.g. `"SW_exact_corner"`,
`"NE_SW_diagonal"`, `"CENTER"`) aren't real compass ticks — drop them and
keep only the clean `N/NE/E/SE/S/SW/W/NW` tokens.

## Naming convention

One file per item, lowercase-hyphenated, matching the display name via
`slugify()` (e.g. "Master Bedroom" → `master-bedroom.svg`). Never rename a
file by hand — rename the entry in the `data-*.js` array and re-run
`build.js`.

## Reviewing a full set

Open `assets/icons/gallery.html` (served over HTTP, not `file://` — browser
tooling blocks local file navigation) for a grouped, labelled grid of every
icon. Regenerate it any time via `build.js`; never hand-edit the gallery
file itself.
