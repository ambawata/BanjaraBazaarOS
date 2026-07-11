# Vastu Knowledge Engine — Build Log

Branch: `feature/vastu-knowledge-engine` (not `main` — see note at the end of this file).

## Phase 0 — Orient

- Read `docs/MASTER_ROADMAP.md`, `docs/PROJECT_STATUS.md`, `docs/PRODUCTION_RISKS.md`.
- Confirmed stack: PHP 8, MySQL via `Backend\Core\Database::connection()` (PDO), REST routes under `/api/v1/` in `backend/api/v1/routes.php`, service-layer pattern in `backend/services/`.
- No existing Vastu-related backend code or DB tables — this is new, additive work.
- Safety rails followed: all new DB objects are named `vastu_kb_*`; no existing table, route, or file outside the Vastu Griha scope was touched.

## Phase 1 — Load enriched data

- Source: user-provided `vastu_kb_enriched.json`, copied verbatim into `knowledge-base/vastu_kb_enriched.json`.
- Parsed successfully. Entry count: **46**. Total `query_aliases`: **266**.
- No aliases or knowledge fields were regenerated or edited — data taken as final for this run.

## Phase 2 — Schema + seed (2026-07-10 18:03:37)
Seeded 46 entries, 266 aliases, 267 sources, 73 severity overrides, 18 color rules.

## Phase 2 — Schema + seed (2026-07-10 18:03:43)
Seeded 46 entries, 266 aliases, 267 sources, 73 severity overrides, 18 color rules.
(Second run above shows the same counts as the first — confirms the seed is idempotent, re-running does not duplicate rows.)

Tables created (all `CREATE TABLE IF NOT EXISTS`, all named `vastu_kb_*`):
- `vastu_kb_entries` — one row per knowledge entry; normalized columns (category, topic, entry_type, confidences, reasoning, disagreement, remedy, severity_default) plus a `raw_json` column holding the entry's full original JSON verbatim, so no field is ever dropped regardless of an entry's shape (arrays vs. strings, nested matrices, etc.).
- `vastu_kb_aliases` — one row per `query_alias`, tagged `lang` = `devanagari` or `latin`.
- `vastu_kb_sources` — one row per source name cited per entry.
- `vastu_kb_severity_overrides` — one row per direction-specific severity override.
- `vastu_kb_color_rules` — one row per zone/room color rule (CO-01's `by_zone`, CO-02's `by_room`).

## Phase 3 — Search API

- `GET /api/v1/vastu/search?q=` and `GET /api/v1/vastu/top-topics` added to `backend/api/v1/routes.php`, backed by `backend/services/VastuKbService.php`. Both are public (no auth) — this is reference knowledge, not user data.
- Ranking is token-overlap based rather than plain substring `LIKE`: real Hindi/Hinglish phrases ("toilet kis disha mein") rarely appear verbatim inside a stored alias even when they mean the same thing, because word order and filler words (kis/mein/hai/chahiye/की/है/दिशा) vary. A stopword list (English + Hinglish + Devanagari fillers) is excluded from overlap scoring so the one real content word ("toilet", "almari", "तुलसी") drives the match instead of being drowned out by generic filler.
- Every hit returns: `best_direction`, `avoid`, `confidence.location` / `confidence.effect` (each explicitly labelled "source consensus", never "scientific"), `both_sides` (the disagreement note, flagged whenever a two-layer entry exists), `remedy` with the mitigation caveat attached, `severity` (default + per-direction overrides), `sources`, and a `detail` object containing the entry's complete original JSON — so two-layer fields (e.g. MI-01's `best_beginner` vs `best_advanced_16zone`), RZ-01's room matrix, etc. are always available to the UI even though they aren't part of the normalized envelope.

## Phase 4 — UI

- `apps/vastu-griha/v2/src/lib/vastuKbApi.js` — API client (base URL via `VITE_VASTU_API_BASE`, defaults to `http://localhost:8000`).
- `apps/vastu-griha/v2/src/features/planner/widgets/home/VastuKbCard.jsx` — result card: direction pills, separately-labelled location/effect confidence ("source consensus"), remedy + caveat, "Show both sides" expander, sources list. Purple brand (`#5A1FB3` → `#5D35AE`) scoped to this feature.
- `apps/vastu-griha/v2/src/features/planner/widgets/home/VastuKnowledge.jsx` — search bar (debounced, live results) that falls back to a continuous-scroll discovery feed seeded from `/api/v1/vastu/top-topics` when the search box is empty. Everything rendered comes from the API response — nothing is fabricated client-side.
- Wired into `HomeDashboard.jsx` beneath the item-placement widget.
- Verified live in a browser preview (Vite dev server + local PHP dev server): discovery feed loads 20 cards from `/top-topics`; search for "toilet kis disha mein" returns exactly the toilet/bathroom entry; clicking "Show both sides" reveals MI-01's beginner-vs-advanced-16-zone disagreement text.

## Phase 5 — Verify

Sample queries run against the live search API (required set, all 7 return sensible top hits):

- "sar kis disha mein sona hai" -> SD-01 (head_south), SD-02 (head_east), SD-04 (head_north)
- "almari kahan rakhein" -> FF-01 (wardrobe_almirah)
- "toilet kis disha mein" -> MI-01 (toilet_bathroom)
- "paisa kahan rakhun" -> FF-02 (locker_safe), MI-03b (money_plant)
- "kitchen direction" -> KI-01 (kitchen_zone), CO-02 (color_by_room), KI-02 (gas_stove)
- "main door vastu" -> DE-01 (main_door), DE-02 (threshold_dehleez), DE-03 (door_construction_dos_donts)
- "tulsi kaha lagaye" -> MI-03a (tulsi_plant)

Additional Devanagari queries tested:

- "मुख्य द्वार की दिशा" (main door direction) -> DE-01 (main_door), MI-04 (mirror_facing_main_door), DE-03
- "तुलसी कहाँ लगाएं" (where to plant tulsi) -> MI-03a (tulsi_plant)
- "पैसा कहाँ रखें" (where to keep money) -> 0 hits. Honest gap: the dataset's Devanagari aliases for FF-02/MI-03b don't include a पैसा/धन/तिजोरी phrasing, only Hinglish ("paisa kahan rakhein vastu") and English. Not a bug — no matching alias exists yet in the enriched JSON.

Row counts at completion: 46 entries, 266 aliases, 267 sources, 73 severity overrides, 18 color rules — matches Phase 2 seeding exactly, confirmed via direct `SELECT COUNT(*)` against `banjara_db`.

Endpoints live (local dev): `GET /api/v1/vastu/search?q=`, `GET /api/v1/vastu/top-topics`.

## Why this branch, and what's left before it's live on the phone

- **Branch, not `main`.** `docs/MASTER_ROADMAP.md` and `docs/PRODUCTION_RISKS.md` both independently state that AI edits must not change backend runtime behavior or API contracts without human review, and that all backend changes go through a feature branch + PR. This work adds new backend routes and DB tables, so it stayed on `feature/vastu-knowledge-engine` instead of `main`. Merging to `main` should go through a normal review/PR, same as any other backend change.
- **Not yet reachable from the phone.** Everything above was built and verified against a local PHP dev server and local MySQL — it is not deployed anywhere yet. The `v2-one-ruby.vercel.app` frontend Vinod checks is a separate, standalone Vercel deployment with no backend attached to it. For the search bar / discovery feed to work on his phone, two more steps are needed beyond this backend build: (1) deploy the PHP backend + MySQL somewhere reachable (e.g. the Hostinger target from `docs/PROJECT_STATUS.md`, or another host), and (2) set `VITE_VASTU_API_BASE` on the Vercel deployment to that backend's real URL, then redeploy the frontend. Neither of those is a code change — they're deployment/ops steps outside this task's scope, and are called out here rather than left implicit.
## Phase 2 — Schema + seed (2026-07-11 07:39:54)
Seeded 59 entries, 330 aliases, 324 sources, 81 severity overrides, 18 color rules.

## Phase 2 — Schema + seed (2026-07-11 08:58:31)
Seeded 60 entries, 336 aliases, 333 sources, 81 severity overrides, 18 color rules.

## Phase 7 — Real Vastu Knowledge Engine frontend (illustrated room-scene UI)

A `vastu_kb_ui_sample.html` was attached as the visual reference, but its actual content (purple colors, Devanagari-only text, a spinning N/E/S/W compass) contradicted the written spec (orange/cream, Hinglish default, a room illustration with a dashed selection box, language toggle). Flagged the mismatch and confirmed with the user before building: **the written spec is authoritative**, not the attached file — built orange/cream + Hinglish-default as instructed.

- **Found and generalized the existing room-scene component** rather than building a new one: `ItemPlacementWidget.jsx` already had exactly this pattern (SVG wall/floor/sofa scene with a dashed selection box), but hardcoded to "mirror in a living room." Extracted it into `src/components/vastu/RoomScene.jsx`, now data-driven — takes `roomType` (living/bedroom/kitchen/entrance/bathroom/pooja/exterior) and `state` (best/avoid/neutral/lowConfidence) and draws the right furniture silhouette + highlight color per category. The original `ItemPlacementWidget.jsx` (the mirror-in-cart tool) is untouched and still works independently.
- **Language toggle**: `src/lib/vastuLang.js` — a plain three-object string dictionary (hinglish/hi/en), no i18n library. Hinglish is default. UI chrome (search hint, buttons, badges, confidence labels) is fully translated; per-entry item names use a curated Hinglish/Hindi/English name table (`src/lib/vastuEntryHelpers.js`) for the ~60 known entries, falling back to a humanized topic slug for anything not yet curated, and to the first Devanagari `query_alias` found in the entry for the Hindi item name when no curated translation exists — an honest fallback rather than pretending every entry has a hand-translated name.
- **HomeFeed** (`src/components/vastu/VastuApp.jsx`): search bar (debounced, live), category chips (tapping one re-queries `/api/v1/vastu/search` with the category slug), and a card feed. Default/no-search state loads `/api/v1/vastu/top-topics`.
- **VastuCard** (`src/components/vastu/VastuCard.jsx`): small room-scene + category label + item name + direction pills (best filled orange) + "More dekhein" button — all entries render through this same component, driven entirely by API response shape.
- **VastuDetailView** (`src/components/vastu/VastuDetailView.jsx`): larger room-scene, tappable direction pills (tapping any direction updates the illustration and badge live — "IS DISHA MEIN SAHI!" in orange when the tapped direction is in `best`, a red "IS DISHA MEIN NAHI" when it's in `avoid`), location/effect confidence bars labelled "source consensus", remedy block with the mitigation caveat, a "Dono pakh dekhein" expander that only renders when `both_sides.has_disagreement` is true, source count, back button.
- **Color-rule entries** (CO-01/CO-02, nested `by_zone`/`by_room`): don't fit the room-scene pattern at all (no single best/avoid direction) — built `VastuColorCard.jsx` using the same card shell but a color-swatch grid instead of an illustration, for both the feed and detail view.
- **Low-confidence handling**: `isLowConfidence()` in `vastuEntryHelpers.js` reuses the entry's real `confidence.location` value (null or <60) rather than inventing a separate rule — e.g. `KI-06` (kitchen-above-bedroom, location_confidence 55) correctly renders a muted, dashed grey room-scene with a "Confidence kam hai" badge instead of the same visual certainty as a 90%-confidence entry like the main door. (The task's example ID `RZ-14` doesn't exist in the actual 60-entry dataset — used the real low-confidence entry found by checking live API data instead of guessing.)
- Replaced the earlier purple `VastuKnowledge.jsx` / `VastuKbCard.jsx` widgets entirely (superseded by this orange/cream system per the locked design) — removed both files, swapped the mount point in `HomeDashboard.jsx` to `<VastuApp />`.
- Verified live in a browser preview against the local PHP backend: home feed renders a mix of room-scene cards and color-swatch cards; opened the main-door detail view, tapped NE (best) → orange badge, tapped SW (avoid) → badge and illustration turned red live; toggled Hindi → item name switched to its Devanagari alias and all chrome translated; searched and opened `KI-06` → correctly showed the muted low-confidence state. Checked at 375px width — layout holds.
- `npm run build` passes cleanly, no new errors or warnings beyond the pre-existing single-chunk-size notice.

