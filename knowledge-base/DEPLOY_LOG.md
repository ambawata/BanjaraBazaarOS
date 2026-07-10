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
