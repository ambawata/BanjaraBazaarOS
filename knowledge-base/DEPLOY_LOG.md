# Vastu Knowledge Engine — Deployment Log

Server: 187.127.185.245 (Ubuntu 24.04 VPS, shared with Zybo Tech Lab's production `banjarabazaar.online`).
All work below was additive-only — nothing belonging to Zybo or the `banjaramarketgurgaon.com` Website Builder site was read, edited, or restarted.

## Access bootstrap

- Logged in once with the root password provided live in chat (never written to any file).
- Created a dedicated non-root sudo user `vastu-deploy` with a fresh SSH keypair (`~/.ssh/vastu_deploy` on the local machine). Confirmed passwordless SSH + passwordless sudo works as that user.
- The root password was not used again after this step, and is not stored anywhere.

## Recon (before any change)

- Web server: Nginx only (no Apache).
- Two pre-existing sites, both Zybo's: `banjara` (→ `myadmin.banjarabazaar.online`, Django/gunicorn) and `banjara_next` (→ `banjarabazaar.online` / `www.`, Next.js on port 3000). Left untouched — file hashes and modification timestamps checked before and after this deployment and confirmed identical.
- PHP and MySQL were **not installed at all** prior to this task — no shared pool or shared DB engine to isolate from.
- `/var/www/` contained only the default Nginx placeholder — Zybo's app does not live there.
- `api.banjaramarketgurgaon.com` already resolved to this server (DNS was pre-configured).
- `ufw` firewall was inactive (no OS-level port blocking); left as-is rather than enabling it, to avoid any risk of affecting Zybo's existing traffic.

## What was created (all new, all isolated)

- **Directory:** `/var/www/banjarabazaaros-vastu/` — `git clone` of the `feature/vastu-knowledge-engine` branch.
- **PHP:** PHP 8.3 + PHP-FPM installed (was not present before). Dedicated pool `banjarabazaaros-vastu` with its own Unix socket `/run/php/banjarabazaaros-vastu.sock`, separate from the default `www` pool.
- **Database:** MySQL 8.0 installed (was not present before). Database `banjara_db`, charset `utf8mb4`/`utf8mb4_unicode_ci`. Dedicated user `banjara_vastu`@`localhost`, `GRANT ALL` scoped to `banjara_db` only — no access to any other database on the server. Seeded via the existing idempotent `scripts/seed_vastu_kb.php`: 46 entries, 266 aliases, 267 sources, 73 severity overrides, 18 color rules — identical counts to the local build.
- **Nginx:** new site file `/etc/nginx/sites-available/banjaramarketgurgaon-api`, server_name `api.banjaramarketgurgaon.com`, serving only the `/api/v1/vastu/` path prefix from the isolated PHP-FPM socket; everything else on this domain returns 404 (verified). Zybo's two site files were not edited.
- **SSL:** new, separate Let's Encrypt certificate for `api.banjaramarketgurgaon.com` via Certbot's Nginx plugin (auto-renewing, expires 2026-10-08). Did not touch or reuse Zybo's `banjarabazaar.online` / `myadmin.banjarabazaar.online` certs — confirmed all three certs list independently in `certbot certificates`.
- **CORS:** `.env` on the server scopes `CORS_ALLOWED_ORIGINS` to `https://v2-one-ruby.vercel.app` (plus localhost for dev) — verified the live API returns the `Access-Control-Allow-Origin` header only for that origin.
- **Secrets:** the generated MySQL password only ever existed in a temp file on the server (`/tmp/...`, deleted immediately after use) and in the server's `.env` (which is `chmod 640`, owned by `www-data`, and already `.gitignore`d — never committed). It is not in this log, any commit, or anywhere else.

## DNS

Resolved correctly to `187.127.185.245` at the time of deployment — no propagation wait was needed.

## Verification

- `curl https://api.banjaramarketgurgaon.com/api/v1/vastu/search?q=toilet` → returns `MI-01` (`toilet_bathroom`), matching the local `BUILD_LOG.md` result exactly.
- `curl https://banjarabazaar.online/` and `curl https://myadmin.banjarabazaar.online/` both still return `200` after this deployment — Zybo's sites are unaffected.
- CORS preflight from `https://v2-one-ruby.vercel.app` origin returns the correct `Access-Control-Allow-Origin` header.
- Vercel project `teambb/v2` updated: `VITE_VASTU_API_BASE=https://api.banjaramarketgurgaon.com` set for Production and Preview, then redeployed to `https://v2-one-ruby.vercel.app`. Confirmed the deployed JS bundle now references `banjaramarketgurgaon.com` (no `localhost` fallback baked in).

## Verify on your phone

Open **https://v2-one-ruby.vercel.app**, scroll to "Vastu Knowledge," and search — it now hits the live server instead of a local dev machine.

## Update — 2026-07-11: 46 → 59 entries

- Replaced `knowledge-base/vastu_kb_enriched.json` on the server with the updated file (13 new gap-fill entries: `WE-05`, `MI-06`–`MI-10`, `SD-09`, `FF-08`, `RZ-03`–`RZ-06`, `KI-06`; plus a re-confirmed fridge-direction verdict on `KI-05`, unchanged).
- Re-ran `scripts/seed_vastu_kb.php` (same UPSERT-based script, no schema change) — the 46 existing entries updated in place, 13 new ones inserted, nothing duplicated.
- **Bug found and fixed along the way:** `RZ-03`'s `effect_confidence` is a descriptive string (`"not_applicable_mythological_foundation"`) rather than a 0–100 number — the first entry in the dataset to do this. The `vastu_kb_entries.effect_confidence` column is numeric, so the raw seed insert failed. Fixed `scripts/seed_vastu_kb.php` to store `NULL` in that normalized column when the source value isn't numeric — the original string is still preserved in full inside `raw_json`, so nothing is lost, just not exposed as a fake number. Verified locally before re-running on the server.
- Also found the deploy user (`vastu-deploy`) couldn't read the server's `.env` for this CLI run, because it had been `chown`'d to `www-data` after the first deployment (so PHP-FPM could read it) — that inadvertently locked out `vastu-deploy`'s own CLI access. Fixed by adding `vastu-deploy` to the `www-data` group, so both the running app and future manual re-seeds can read it.
- Fresh `SELECT COUNT(*)` after re-seeding: `vastu_kb_entries` = **59**, `vastu_kb_aliases` = 330, `vastu_kb_sources` = 324, `vastu_kb_severity_overrides` = 81, `vastu_kb_color_rules` = 18.
- Tested 3 new sample queries against the live HTTPS API — all three correctly top-matched the intended new entry:
  - "septic tank direction vastu" → `WE-05` (septic_tank)
  - "living room direction vastu" → `RZ-06` (living_room_drawing_room)
  - "vastu vs feng shui" → `MI-09` (vastu_vs_feng_shui)
- Re-checked Zybo's two live sites after this update — both still return `200 OK`, unaffected.

## Update — 2026-07-11: 59 → 60 entries

- Replaced `knowledge-base/vastu_kb_enriched.json` on the server again with the newest file. Only one new entry versus the previous 59-entry update: `RZ-07` (south-facing-house good-or-bad). `KI-05` (fridge direction) got additional cross-check detail appended (sources, `gap_check_status`) — its core SW-primary verdict is unchanged. A new top-level `gap_check` provenance object was added to the JSON; left out of seeding as suggested — it's metadata about the update itself, not a knowledge entry, and the existing `raw_json`-per-entry design has no natural home for a document-level (non-entry) object without adding a table for a single settings row, which isn't worth it for one metadata blob.
- Re-ran `scripts/seed_vastu_kb.php` — no code changes needed this time (last update's non-numeric-confidence fix already covers this file). UPSERT only, existing 59 entries updated in place, 1 new (`RZ-07`) inserted.
- Before → after row counts (fresh `SELECT COUNT(*)` both times):
  - `vastu_kb_entries`: 59 → **60**
  - `vastu_kb_aliases`: 330 → 336
  - `vastu_kb_sources`: 324 → 333
  - `vastu_kb_severity_overrides`: 81 → 81 (unchanged — RZ-07 doesn't define per-direction overrides)
  - `vastu_kb_color_rules`: 18 → 18 (unchanged — no new color-rule entries)
- Tested all 8 new sample queries against the live HTTPS API — **8/8 correct top hit**:
  - "septic tank direction vastu" → `WE-05`
  - "missing corner vastu remedy" → `MI-06`
  - "fish tank direction vastu" → `MI-07`
  - "vastu for rented house" → `MI-08`
  - "vastu vs feng shui difference" → `MI-09`
  - "living room direction vastu" → `RZ-06`
  - "south facing house good or bad" → `RZ-07`
  - "what is vastu purusha mandala" → `RZ-03`
- Re-ran 3 original queries to confirm nothing broke: "toilet kis disha mein" → `MI-01`, "almari kahan rakhein" → `FF-01`, "kitchen direction" → `KI-01` — all still correct.
- Re-checked Zybo's two live sites (`banjarabazaar.online`, `myadmin.banjarabazaar.online`) — both still `200 OK`. Also diffed the `md5sum` of their nginx site files against the values recorded in the previous update — identical, confirming no accidental edits.

## Update — 2026-07-11: query logging + zero-hit report

- New table `vastu_kb_query_log` (`database/migrations/2026_07_11_vastu_kb_query_log.sql`, `CREATE TABLE IF NOT EXISTS`, additive-only): `query_text`, `matched_entry_ids` (comma-separated, NULL on zero hits), `result_count`, `matched_top_score`, `low_confidence` (boolean), `created_at`. No requester identity stored anywhere (no IP, no user id, no session) — this is aggregate usage data, not per-user tracking.
- `low_confidence` reuses the exact score-30 cutoff the search ranking already applies internally to decide whether a match is worth showing (`VastuKbService::LOW_CONFIDENCE_SCORE_THRESHOLD`, was previously an inline literal in the ranking filter) — didn't invent a second threshold that could drift out of sync with the real one.
- Every call to `GET /api/v1/vastu/search` now logs the query as a fire-and-forget insert inside `VastuKbService::search()`, wrapped in try/catch — a logging failure is written to the PHP error log and never affects the search response. Confirmed: search response time unaffected (~170ms for a normal query, same order of magnitude as before logging was added).
- New endpoint: `GET https://api.banjaramarketgurgaon.com/api/v1/vastu/zero-hit-report?days=30` (days optional, defaults to 30) — returns zero/low-confidence queries from the log, deduplicated by normalized (lowercased/trimmed) query text, sorted by frequency descending. No UI, JSON only, meant to be checked periodically as the priority worklist for new knowledge-base entries.
- `scripts/seed_vastu_kb.php` generalized to apply every `*vastu_kb*.sql` file under `database/migrations/` in filename order (was previously hardcoded to just the original schema file), so this and any future migration apply automatically on every seed run without a separate step.
- Tested on the live API: searched "toilet kis disha" (a real, well-covered query) and "asdkjaskjd" (nonsense) — then called the zero-hit-report endpoint and confirmed **only** the nonsense query appears (`frequency: 1, best_result_count: 0`); the real query does not appear, as expected.
- Re-checked Zybo's two live sites — both still `200 OK` after this change.
