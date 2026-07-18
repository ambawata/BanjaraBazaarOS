---
name: vastu-griha-design
description: Apply Vastu Griha's locked visual design system — colors, typography, illustration style, language defaults — when building or modifying any frontend UI in this project. Use whenever creating screens, cards, or components for the Vastu Griha app.
---

# Vastu Griha Design System

Locked visual language for the Vastu Griha app (`apps/vastu-griha/v2`). This
governs the Vastu Knowledge Engine screens (`src/components/vastu/`) and
should be the default for any new screen/card/component added to the app —
don't invent a parallel palette or interaction pattern.

## Color tokens

| Token | Hex | Use |
|---|---|---|
| `--orange` | `#E08A3C` | primary accent — buttons, best-direction pills, highlight boxes |
| `--orange-dark` | `#C96F24` | headings, category labels, pressed/active states |
| `--orange-light` | `#FBE6D0` | button backgrounds, subtle highlight fills |
| `--cream` | `#FAF5EC` | page/section background |
| white | `#FFFFFF` | card backgrounds |
| `--red` | `#C24545` | avoid-direction pills, wrong-direction badge, warnings only |
| `--green` | `#3D8B5F` | used sparingly, only where an earlier design explicitly calls for it — not a general-purpose success color in this system (orange already carries that meaning here) |

Never introduce a new accent color without a semantic reason. Red is
reserved for "avoid/wrong," it's not a generic error color.

## Typography

- **Headings** (topic names, section titles): Poppins, weight 600–700.
- **Body** (descriptions, labels, buttons): Inter.

## Border-radius scale

- **20px** — cards (the outer shell of any card component)
- **14px** — medium elements (search input, secondary containers)
- **10px** — small elements and pills (buttons, direction pills, badges)

Stay on this three-step scale — don't add a fourth radius value ad hoc.

## The illustrated "room scene" pattern

Every knowledge-base entry gets its **own distinct, accurate illustration**
— a door looks like a door (with a swing arc), a stove has burners, a
fridge is a tall box. Never fall back to a shared generic scene (e.g. reusing
a sofa-in-a-living-room illustration for an unrelated item) — that reads as
a bug, not a design choice, and it has been the exact cause of two prior
fixes in this project.

**Canonical implementation — extend it, don't fork a parallel system:**
- `apps/vastu-griha/v2/src/components/vastu/RoomScene.jsx` — draws the
  illustration. Takes an `objectType` (interior items: door, mirror,
  wardrobe, bed, stove, sink, fridge, toilet, pooja, staircase, tanks,
  well, fish tank, plants, dining table, parking...) or an
  exterior/conceptual composition (house-facing + compass, mandala grid,
  basement cross-section, plot-shape overlay) for whole-house or
  non-physical entries. Each object type has its own `HIGHLIGHT_BOX`
  coordinates so the dashed selection box actually sits over the object
  (not a floating fixed rectangle).
- `getObjectType(entry)` in `apps/vastu-griha/v2/src/lib/vastuEntryHelpers.js`
  — maps each entry_id (with a category-level fallback) to the right
  illustration. **Adding a new KB entry that needs its own illustration**:
  add a case to `OBJECT_TYPES` there, and if no existing `InteriorObject`/
  `ExteriorScene` case fits, add a new one in `RoomScene.jsx` following the
  same line-weight/palette/proportions as the existing cases — don't build
  a second illustration component.

Every illustration sits inside the same card frame with a dashed
`--orange` box marking the recommended zone (or `--red` when the currently
selected direction is one to avoid, or muted grey/dashed for a
low-confidence entry — see Interaction pattern below).

## Interaction pattern — tappable direction pills

Direction pills (N/NE/E/SE/S/SW/W/NW) are tappable in the detail view.
Tapping one updates the illustration and badge live:
- Tapped direction is in `best` → orange dashed box, badge reads
  **"IS DISHA MEIN SAHI!"**
- Tapped direction is in `avoid` → red dashed box, badge reads
  **"IS DISHA MEIN NAHI"**
- Tapped direction is in `fallback` (a genuine but secondary/contested
  recommendation) → dashed light-orange pill, distinct from a clean best —
  never merge fallback into best or drop it silently.

Component: `DirectionPills.jsx` + the `activeDirection` state in
`VastuDetailView.jsx`.

## Language — Hinglish is the default, not Hindi or English

Default UI language is **Hinglish (Roman script)** — not Devanagari Hindi,
not English. A toggle for हिंदी / English exists (`src/lib/vastuLang.js`)
but Hinglish is what loads first and what new copy should be written in by
default, matching the existing tone: "More dekhein", "Disha bharosa",
"Sabse achha", "Bachein", "Dono pakh dekhein". Write new UI strings in all
three languages in `vastuLang.js`'s `STRINGS` object (`hinglish`/`hi`/`en`)
— never ship a string only in English.

## Data-shape rule — always go through normalizeDirections()

The knowledge base does **not** use one consistent shape for "what
direction does this recommend" — some entries have `best`/`avoid` arrays,
some have `verdict`+`best_for` (sleeping-direction entries — the direction
is the *topic*, not a field), some have `conditions_for_good_outcome`
nested prose instead of compass tokens. New entries keep arriving via the
zero-hit-report workflow (`/api/v1/vastu/zero-hit-report`) in whatever
shape their source material happens to use.

**Never read `entry.best`, `entry.avoid`, `entry.best_direction`, etc.
directly.** Always go through `normalizeDirections(entry)` in
`vastuEntryHelpers.js`, which returns
`{ bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText, conditions }`
and already handles every shape seen so far. If a new entry shape appears
that it doesn't handle correctly, fix the adapter — don't add a special
case in a component.

## Confidence display rule

`location_confidence` and `effect_confidence` are always shown as **two
separate bars/values**, each labelled **"source consensus"** — never
"scientific," never merged into one number. This engine reports what
sources agree on, not an empirical measurement; the labelling must not
overclaim.

## Remedy display rule

Any remedy shown must always carry the fixed mitigation caveat beneath it:
*"Most remedies mitigate, not cure — relocation is the ideal fix."* Never
show a remedy without this caveat, and never reword it per-entry — it's a
constant, sourced from the KB's top-level `remedy_caveat` field.
