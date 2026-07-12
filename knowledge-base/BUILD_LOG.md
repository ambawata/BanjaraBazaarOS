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

## Phase 8 — Per-object illustrations (fixed the "generic sofa scene" reuse bug)

Phase 7's `RoomScene` mapped by **category** (e.g. every `furniture_fixtures` entry → 'living', every `kitchen` entry → 'kitchen'), so a wardrobe, a locker, a mirror, a TV, and a sofa all rendered the exact same sofa-in-a-living-room illustration with only the dashed box recolored — the "dummy/generic" problem this phase fixes.

- **Remapped by entry, not category**: `getObjectType(entry)` in `vastuEntryHelpers.js` replaces the old `getRoomType()` — an explicit entry_id → object-type table for all 60 live entries (`OBJECT_TYPES`), falling back to a category-level guess only for any future entry not yet in the table. Entries only share an illustration now when they're genuinely the same physical thing (e.g. `DE-01`/`DE-02`/`DE-03`/`DE-04` all show the door scene because they're all about the main door; `KI-02` gas-stove and `KI-03` cooking-facing-direction both show the stove because cooking-facing direction *is* about the stove; `RZ-06` living-room and `FF-06` sofa-seating share the sofa scene because they're the same room).
- **26 distinct object illustrations added** to `RoomScene.jsx`, replacing the single hardcoded sofa scene: door (with swing-arc), mirror (kept as the original reference), wardrobe, locker/safe (small box, not furniture-sized), study table + chair, wall TV, sofa, bed, framed painting, stove (counter + burners), sink (basin + tap), fridge, general kitchen counter, toilet fixture, staircase (ascending steps), pooja alcove + diya, underground water tank (drawn *below* a ground line), overhead water tank (drawn *on a rooftop* — visually opposite of the underground one, per the task's explicit requirement), septic tank, well (rim + pulley), fish tank/aquarium, tulsi (potted, raised stand), money plant (climbing vine), general potted plant, dining table + 4 chairs, outdoor parking/driveway.
- **New "exterior/conceptual" composition**, structurally separate from the interior wall+floor+object+dashed-box frame: sky, ground line, house silhouette. Used for whole-house entries rather than forcing them into a single-room illustration:
  - `houseFacing` (`RZ-07`, south-facing-house myth) — house + compass ring with N/E/S/W labels, colored by the tapped direction's correctness, exactly the "facing direction" variant the task asked for. Detected by topic-name pattern (`facing…house`/`house…facing`) so any future `RZ-08`+ facing-direction entry picks this up automatically without a code change.
  - `houseGeneric` (`RZ-01` room-zone matrix, `MI-08` rented-house applicability) — plain house exterior, no compass, for whole-house entries that aren't about one specific direction.
  - `houseCorner` (`MI-06` missing-corner remedy) — house outline with a literal notch cut into one corner.
  - `basement` (`RZ-04`) — house cross-section with the underground level highlighted.
  - `plotShape` (`RZ-05`) — an ideal square plot outline vs. the actual (irregular) plot shape overlaid.
  - `mandala` (`RZ-03`, Vastu Purusha Mandala) — an actual 3×3 grid with the center cell (Brahmasthan) highlighted, directly matching what the entry is about rather than a generic fallback.
  - `concept` — neutral compass-only fallback for foundation/status entries with no physical object (`RZ-00`, `RZ-02`, `RZ-PADA`, `MI-09` vastu-vs-feng-shui, `MI-10` remedies toolkit).
- **Per-object highlight box positions**: the dashed selection box was a single fixed rectangle before, which floated disconnected from objects that don't sit centered/high (a stove sits low on a counter, a fridge is tall, a dining table is wide) — added a `HIGHLIGHT_BOX` coordinate table so the dashed box actually sits over each object.
- **Badge/pills hidden when there's no real verdict**: entries with no `best`/`avoid` data at all (the new conceptual/foundation entries) no longer show a false "IS DISHA MEIN SAHI!" badge or a row of all-neutral direction pills — both are conditionally rendered only when the entry actually has directional data, in both `VastuCard` and `VastuDetailView`.
- Confirmed `CO-01`/`CO-02` still render via `VastuColorCard` (swatch grid), untouched by this change, per the task's explicit "keep as-is."
- **Spot-checked 26 entries** across every category (door ×4, mirror, wardrobe, locker, study table, TV, sofa, bed, stove ×2, sink, fridge, pooja ×3, toilet, staircase, both water tanks, well ×2, fish tank, tulsi, money plant, parking, the new house-facing scene, the new mandala scene, the houseGeneric scene) via live DOM inspection of the actual rendered SVG markup against the local API — confirmed genuinely distinct compositions per object, and confirmed intentional sharing only where the underlying object is actually the same thing. (Pixel screenshots weren't available this session — the browser tool's screenshot capability was down with a timeout on every attempt, confirmed not app-related since `get_page_text` and direct DOM/JS inspection worked fine throughout; used DOM-level SVG-markup comparison instead, which is a more precise check than eyeballing a screenshot for "are these two illustrations actually different.")
- `npm run build` passes cleanly.

## Phase 9 — Fixed silently-empty cards for entries with a different data shape (normalizeDirections)

**Root cause**: the KB does not use one consistent field shape for "what direction does this recommend." The frontend previously read `entry.best_direction` / `entry.avoid` directly (which the API only populates from the raw entry's `best`/`avoid` keys) — so any entry using a different shape rendered with empty pills and no highlight, most visibly the sleeping-direction cards ("Sona" category) which looked like a broken, nearly-empty card with a small illustration.

**Step 1 — shape audit** (all 60 live entries, by which of `best/avoid/fallback/verdict/best_for/conditions_for_good_outcome/door_open` keys are present):

| Shape | Count | Example |
|---|---|---|
| `avoid`+`best` | 26 | most furniture/kitchen/pooja entries |
| `avoid`+`best`+`fallback` | 7 | `WE-01/02/03/05`, `DE-01`, `EA-01`, `MI-07` |
| `avoid`+`best`+`fallback`+`door_open` | 1 | `FF-01` (wardrobe) |
| `best` only, and it's a **string**, not an array | 3 | `SD-07`, `DE-02`, `DE-04` — e.g. `"install_raised_threshold_at_main_entrance"` |
| `verdict`+`best_for` | 2 | `SD-01`, `SD-02` — `best_for` is a list of *who* it suits (`"students"`, `"couples"`), not a direction |
| `verdict` only | 5 | `SD-03`, `SD-04`, `MI-08`, `RZ-04`, `KI-06` |
| `avoid`+`best_beginner`+`best_advanced_16zone`+`fallback` | 1 | `MI-01` (toilet, two-layer) |
| `by_zone` / `by_room` | 2 | `CO-01`/`CO-02` — handled separately by `VastuColorCard`, out of scope here |
| `map` / `matrix` / `rules` | 3 | `RZ-00`/`RZ-01`/`RZ-02` — foundation-level, no single direction |
| `conditions_for_good_outcome`+`verdict` | 1 | `RZ-07` — a list of prose conditions, not compass tokens |
| none of the above | 9 | `MI-03`, `MI-04`, `MI-06`, `MI-09`, `MI-10`, `FF-08`, `RZ-03`, `RZ-05`, `RZ-PADA` — genuinely non-directional (plant care rules, a painting-motif list, a plot-shape list, foundation/status entries) |

The sleeping-direction case (`SD-01`–`SD-04`) is the clearest example of why this needed a real fix rather than a patch: those four entries have **no direction field of any kind** — the direction they're about is the *topic itself* (`head_south`, `head_east`, `head_west`, `head_north`), with a `verdict` (`best_overall` / `second_best` / `contested_mixed` / `avoid_universal`) saying whether that direction is good, mixed, or to avoid.

(The task's hypothesis referenced `RZ-08`–`RZ-14`; the live dataset only goes up to `RZ-07`, so those don't exist yet — audited against the real data rather than the assumed IDs, per how the KB actually looks today. The normalizer is written to handle the shape generically, so if `RZ-08`+ facing-direction entries are added later they'll work automatically.)

**Step 2 — `normalizeDirections(entry)`** in `vastuEntryHelpers.js` replaces the old `getBestDirections()`/`getAvoidDirections()`, and is now the *only* place `VastuCard` and `VastuDetailView` read direction data from — neither reads `entry.best_direction`/`entry.avoid` directly anymore. It returns `{ bestDirections, avoidDirections, fallbackDirections, hasVerdictOnly, verdictText, conditions }`:
- Extracts compass tokens from anywhere inside a string or array via `extractDirectionTokens()` — handles both clean arrays (`["NW","W"]`) and compound descriptive strings (`"room_NW_zone__head_S_or_W"` → finds `NW`, `S`, `W`; `"install_raised_threshold_at_main_entrance"` → finds nothing, correctly).
- `fallback` is a **third pill tier**, not merged into `best` or dropped — `DirectionPills` now renders it as a dashed light-orange pill, visually distinct from a solid "best" and a red "avoid."
- Sleeping-direction entries: direction comes from the topic (`head_south` → `S`), routed into best/avoid/fallback by `verdict` (`avoid_universal` → avoid, `contested_mixed` → fallback tier since the opinion is genuinely split, anything else → best).
- `conditions_for_good_outcome` (RZ-07-style) is surfaced as-is — `VastuDetailView` now renders it as a bullet list ("Achhe result ke liye zaroori baatein" / "What matters for a good outcome") rather than trying to force prose conditions into direction pills.
- When an entry truly has no derivable direction (`hasVerdictOnly`), the raw `verdict` or descriptive `best` string is humanized and shown as a plain text line instead of the badge/pills disappearing silently — e.g. `DE-02` (threshold) now shows "Install Raised Threshold At Main Entrance" instead of a blank space.
- Badge/pill visibility in both components now checks `bestDirections.length > 0 || avoidDirections.length > 0 || fallbackDirections.length > 0` (or `hasVerdictOnly && verdictText`) — never shows a false "IS DISHA MEIN SAHI!" claim when there's no real verdict.

**Step 3 — bed illustration sizing bug**: the `bed` object type was left-anchored at x=24–188 of the 320-wide canvas (a leftover from copying the sofa layout, which has a plant filling the right side that bed never got) — leaving ~40% of the frame empty on the right and reading as a "tiny, mostly-empty scene." Recentered the bed (now x=64–256, centered on the canvas) and made it taller (headboard now 32 units tall instead of 16) so it reads at the same visual weight as the other centered illustrations (mirror, door, stove). Updated `HIGHLIGHT_BOX.bed` to match.

**Step 4 — re-verification**, via live DOM inspection against the local API (screenshots intermittently available this session; used DOM/pill-color inspection as the primary check since it's more precise than eyeballing anyway):
- `SD-01` (head_south, best_overall) → **S** pill solid orange (best). ✓
- `SD-02` (head_east, second_best) → **E** pill solid orange (best). ✓
- `SD-03` (head_west, contested_mixed) → **W** pill dashed light-orange (fallback/mixed tier), correctly *not* claimed as a clean best or avoid. ✓
- `SD-04` (head_north, avoid_universal) → **N** pill red (avoid). ✓ Bed illustration now centered and fully visible for all four.
- `EA-01` (eating direction) → **N**/**E** best, **S** avoid, **W** fallback — all three tiers rendering distinctly in one card. ✓
- `RZ-07` (south-facing-house myth, `conditions_for_good_outcome`) → no false badge, all 6 conditions rendered as a bullet list in the detail view. ✓
- `DE-02` (threshold, descriptive `best` string with zero direction tokens) → 0 pills, shows "Install Raised Threshold At Main Entrance" as plain text instead of a blank card. ✓
- **Regression check**: `DE-01` (main door — best/avoid/fallback) and `MI-01` (toilet — two-layer best_beginner/avoid/fallback) both still render identically to before this change. ✓
- `npm run build` passes cleanly.

**Step 5 — IA note (not fixed, flagged for Vinod)**: the pre-existing "Where do you want to place?" `ItemPlacementWidget` (the shop tool with Add to Cart, mirror-only) and the new Vastu Griha knowledge feed are two separate direction-guidance experiences that currently coexist on the same home screen. Left untouched as instructed — this is a product/IA decision (whether to merge, relabel, or keep them distinct) for Vinod to make later, not a bug.

## Phase 10 — Shopping panel on every Vastu answer (placeholder catalog)

A reference file `vastu_shopping_style_sample.html` was requested as the locked design source, but — same as the earlier `vastu_kb_ui_sample.html` mismatch — it doesn't exist anywhere in the repo or this session. Also, the task assumed **63 entries and `RZ-08`–`RZ-14`**; the live KB has **60 entries**, RZ only goes to `RZ-07`, and 5 real entries (`SD-08`, `RZ-00`, `RZ-02`, `RZ-03`, `RZ-PADA`) weren't covered by any of the three tier lists at all. Rather than pause again on a now-familiar pattern, built against the *written* tier rules and the *real* KB data, and assigned the 5 uncovered entries using the same logic as their listed siblings (`SD-08` → same bed-orientation family as `SD-01`–`04`; the four foundation/status entries → Tier 3, same as the other conceptual entries) — every one of the 60 live entries has an explicit tier now, none fall through to a default silently.

**Architecture** (isolated, swappable placeholder layer, per the task's explicit requirement):
- `apps/vastu-griha/v2/src/data/placeholderProducts.js` — 35 unique placeholder product records (name, meta, price, rating, review count, icon key). The task estimated "~20 unique products," but its own tier list names 35 genuinely distinct product types once you actually enumerate it (a wardrobe is not a locker is not a study table) — reused a product across entries only where the task explicitly said to (e.g. `FF-03`/`MI-04` both "Mirror", `KI-02`/`KI-03` both "Gas Stove", `DE-01`/`DE-03` both "Main Door", `MI-10`/`MI-06` both "Vastu Remedy Kit", `CO-01`/`CO-02` both "Wall Paint Sample Set", all sleeping-direction entries → "Bed with Adjustable Headboard"), not forced additional dedup just to hit a round number.
- `apps/vastu-griha/v2/src/data/vastuShoppingTiers.js` — the **only** place that maps an `entry_id` to `{ tier, productId, labelKey }`. `getShoppingInfo(entryId)` is the single lookup function every component calls.
- `apps/vastu-griha/v2/src/components/vastu/ShopPanel.jsx` — renders the panel from that lookup: tier-appropriate label, product icon/name/meta/price/rating, and the CTA (solid orange "Add to Cart" for Tier 1/2, outline "Shop Vastu Essentials" for Tier 3, which routes to the existing Shop tab rather than a fake per-item cart action).
- `apps/vastu-griha/v2/src/components/vastu/ProductIcon.jsx` — small orange-on-cream glyph per product (no Track B illustrations exist yet — `assets/illustrations/` doesn't exist in this repo — and no real product photography exists either, so a placeholder glyph in the established palette stands in, never a broken image or blank box).
- **Nothing is hardcoded per-card.** `VastuCard.jsx`, `VastuColorCard.jsx`, and `VastuDetailView.jsx` all just render `<ShopPanel entryId={entry.entry_id} lang={lang} />` — swapping in real vendor data later means replacing `placeholderProducts.js`/`vastuShoppingTiers.js` (or pointing `getShoppingInfo` at a real product API), with zero changes to the KB or the card components.

**Layout**: two-column (existing Vastu content left, shop panel right) via a plain `flex-wrap` row with `minWidth` on both columns — no media query. Combined minimum content width (~180px illustration column + ~132px shop panel + gap ≈ 324px) doesn't fit inside a card's content width at a 375px viewport once the app shell's own padding is subtracted, so it wraps to a clean vertical stack automatically at mobile widths.

**Cart wiring**: reused the app's actual existing mechanism — `useUiStore.getState().addNotification(...)`, the same call `ItemPlacementWidget.jsx`'s "Add to Cart" already makes — rather than inventing a new cart system. Did drop the accompanying `alert()` popup specifically, since that pattern makes sense for one button on a single-item tool but would mean a blocking dialog on every one of 60 list cards; the button shows an inline "Added ✓" state for 1.5s instead, using the same underlying notification call.

**Verification**: `npm run build` passes cleanly. Verified statically (not visually — see note below): tier coverage is 100% across all 60 real entries (script-checked, zero silent fallbacks); every `productId` referenced in `vastuShoppingTiers.js` exists in `placeholderProducts.js` and vice versa (zero orphaned or dangling references); spot-checked the exact lookups for `FF-01`, `SD-01`–`04`, `SD-08`, `RZ-07`, `CO-01`/`02`, `KI-02`/`03`, `DE-01`/`03`, `MI-10`/`06` and confirmed the shared-product de-duplication resolves correctly (e.g. all of `SD-01`–`04` and `SD-08` point to the same `bedHeadboard` product id, so they'll render identical price/rating/icon).

**Update — live verification completed**: the Browser tool's safety-check service was down for a stretch of this session (every `preview_start` call failed with a temporary-unavailable error) — committed with only the static/data-level checks above at that point. It recovered before the end of the session, so went back and actually looked:
- `FF-01` (Almari, Tier 1) → "Perfect ke liye yeh disha!", wardrobe icon, Solid Wood Wardrobe ₹18,999, solid orange Add to Cart. Clicked it — the notification bell count incremented (3→4), confirming `addNotification` genuinely fires, not just a UI mock.
- `CO-01`/`CO-02` (Tier 2) → "Is disha mein theek karne ke liye", Wall Paint Sample Set ₹449, both entries showing the same product as designed.
- `RZ-07` (Tier 3) → "Apna ghar Vastu-friendly banayein", Vastu Compass + Remedy Kit ₹1,299, outline "Shop Vastu Essentials" button (visually distinct from the solid Tier 1/2 button, links to the Shop tab).
- At 375px width, both the detail view and feed cards stack the illustration/pills above the shop panel cleanly — no overflow, matches the flex-wrap math.
- `SD-01`, `SD-02`, `SD-04` (three of the five bed-orientation entries) DOM-inspected together — all three show identically ₹16,999 / 4.3★ (66) for "Bed with Adjustable Headboard," confirming the shared-product de-duplication actually renders identically, not just resolves identically in data.

This is still placeholder data pending real vendor integration from BanjaraBazaarOS's marketplace — every price/rating/review count here is fabricated-but-plausible, not real.

## Phase 11 — One locked template, sideways carousel (replaces vertical list + separate detail view + old mirror tool)

Consolidated three previously-separate UI surfaces (vertical feed list with search/category chips → tap → separate detail view; plus the standalone hardcoded "Wall Mirror" `ItemPlacementWidget.jsx`) into a single locked template rendered one topic at a time, navigated by horizontal swipe. Explicit decisions confirmed by the user before building:
- Fully replace the vertical list — search bar and category chips are gone, not just restyled.
- Remove `ItemPlacementWidget.jsx` entirely rather than leave it alongside the new system.
- Use the full 8-direction set (N/NE/E/SE/S/SW/W/NW) via the existing `DirectionPills` component, not the mirror tool's original 4-direction set.

**New files**:
- `apps/vastu-griha/v2/src/components/vastu/VastuTopicCard.jsx` — the single locked template every topic renders through (all 60 today, any added later via the zero-hit-report workflow). Merges what was previously split across `VastuCard.jsx` (feed card) and `VastuDetailView.jsx` (detail screen) into one component, since there's no separate "tap to see more" step anymore — the topic card is the full view. Layout is modelled on the retired mirror tool: header ("Where should X go?" pattern) → direction chip row → split box (illustration or color grid on the left, `ShopPanel` on the right) → confidence bars / remedy / conditions / both-sides / sources beneath. Colors stay the already-locked Vastu Griha orange/cream palette, not the mirror tool's `var(--accent)` token (that token is inconsistent elsewhere in the app) — only the layout/structure was copied from the mirror tool, not its color tokens.
- `apps/vastu-griha/v2/src/components/vastu/VastuCarousel.jsx` — native CSS scroll-snap track (`scroll-snap-type: x mandatory`, one `VastuTopicCard` per full-width page) so touch swipe works for free on phones; arrow buttons + progress dots cover desktop/mouse. Progress dots are capped at the first 20 entries for visual sanity — this caps the dot *display* only, navigation itself (arrows, `scrollToIndex`) works across the full entry list regardless of dot count.

**Removed**: `apps/vastu-griha/v2/src/features/planner/widgets/home/ItemPlacementWidget.jsx` (the hardcoded single-item mirror tool, plus its usages and associated `placementDirection` state in both `HomeDashboard.jsx` and `PlannerWorkspace.jsx` — the latter had its own separate mount of the same widget on its own "Home" tab, replaced with `<VastuApp />` there too for consistency), `VastuCard.jsx`, `VastuColorCard.jsx`, `VastuDetailView.jsx` (superseded by `VastuTopicCard.jsx`).

**Backend**: `VastuKbService::TOP_TOPICS_LIMIT` raised from 20 to 500 — the old value was a "top picks" sample size; the carousel needs every entry, not a sample.

**Verification**: `npm run build` passes. Live-tested via the `vastu-griha-v2-cors` dev server + local PHP backend at 375px mobile width: carousel renders one topic at a time with a working `n / 59` counter; tapping the next-arrow advances the topic and updates the counter; a color-rule entry (Rang/CO-01, CO-02) renders its `ColorGrid` + `ShopPanel` variant correctly inside the carousel; a verdict-only entry with no direction data (Dehleez threshold) correctly renders with no direction-pill row; a bed-orientation entry (SD-*) renders all 8 direction pills, tapping a pill updates the active-pill highlight live; the old mirror tool is confirmed gone from both `HomeDashboard.jsx` and `PlannerWorkspace.jsx`'s Home tab.
