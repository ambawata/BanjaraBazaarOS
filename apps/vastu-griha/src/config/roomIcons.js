// FOLLOW-UP ITEM: the task asked to reuse the existing Design Asset
// Library's 130-icon SVG set for these room icons if it exists. It does
// not exist anywhere in this repository yet (searched the whole tree for
// any "icons"/"assets" directory under apps/* — none found; there IS an
// "icon-library-style" skill documenting a locked style recipe for a
// future ~130-icon set, but the actual SVG files haven't been created/
// committed yet). Using simple emoji as placeholders per the task's
// explicit fallback instruction. Swap `emoji` for a real icon component
// once that asset library lands — every consumer of ROOM_TYPES already
// reads `icon` as an opaque render value, so the swap is contained here.
// EMOJI RENDERING NOTE: the two emoji this replaced (🍳 fried-egg U+1F373
// for Kitchen, 🪜 ladder U+1FA9C for Staircase) are valid, semantically
// correct Unicode — but verified live in the actual app (Browser pane,
// this repo's target environment's font stack) they render WRONG: 🍳
// displays as a magnifying-glass-shaped monochrome fallback glyph, and 🪜
// doesn't render at all (blank/tofu box). Both replacements below were
// checked the same way — rendered directly in-browser at real icon size,
// not just verified against the Unicode spec name — and both display
// correctly in full color. If the font environment changes (e.g. once a
// real icon library replaces these placeholders — see comment above),
// re-verify visually rather than trusting a codepoint's Unicode name.
export const ROOM_TYPES = [
  { key: 'kitchen', label: 'Kitchen', emoji: '🍲' },
  { key: 'master_bedroom', label: 'Main Bedroom', emoji: '🛏️' },
  { key: 'toilet', label: 'Bathroom', emoji: '🚿' },
  { key: 'main_entrance', label: 'Main Gate/Door', emoji: '🚪' },
  { key: 'living_room', label: 'Living Room', emoji: '🛋️' },
  { key: 'staircase', label: 'Staircase', emoji: '🏢' },
]
