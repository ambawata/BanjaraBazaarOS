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

