# Legacy vanilla-HTML admin-panel/vendor-portal — reference before removal

**Context:** on 2026-07-17, `apps/admin-panel` and `apps/vendor-portal` were rewritten
from their React+Vite scaffolds into single-file vanilla HTML/CSS/JS apps (old React
archived to `_old-react-v3`/`_old-react-v4`). That pivot was rejected on 2026-07-18 —
the whole app is going back to React, using the shared `Sidebar`/`AppShell` from
`shared/ui/` (PR #5) and the light/purple/cream (`#5A1FB3`/`#5D35AE`) palette from
`shared/ui/tokens.js`. This doc captures the one thing in the vanilla rewrite that
doesn't exist anywhere else in the codebase and would otherwise be lost when the
vanilla files are removed: **real production API wiring**. Everything else in the
vanilla version (dashboard layout, nav taxonomy) is either identical to, or a subset
of, what's already in the old React app — see the comparison below.

## Comparison summary (full detail in PR description / session notes)

- **Old React app (`_old-react-v3`, `_old-react-v4`, as actually routed via `App.jsx`)
  has zero real API calls anywhere** — confirmed via `grep -rl "fetch(" src/` on both,
  no matches. 100% local mock/hardcoded data.
- **The vanilla rewrite added real, working integration** against the live production
  API (`https://api.banjaramarketgurgaon.com`) for: admin-panel's Vendor Directory +
  Approval Queue (list + approve/reject/suspend actions), and vendor-portal's Login +
  vendor registration/onboarding. This is genuinely new work, not present in old React
  in any form — old React's own `Login.jsx` fakes auth via a `setTimeout` + hardcoded
  demo credential check (`riya@riyacrafts.com` / `vendor123`), no network call at all.
- **Admin-panel's dashboard/nav is a near-exact structural port** of old React's
  `screens/` version (identical 26-item nav taxonomy, section groupings, badge counts,
  same CSS class naming conventions) — nothing new to preserve there. Old React's
  `screens/Dashboard.jsx` is actually *more visually elaborate* (10 KPI cards across
  two rows, a Live Sales Feed, a category bar chart, a Staff Status panel) than the
  vanilla one (4 KPI cards, computed from seeded state, a Recent Sales table, a
  dynamic Alerts panel) — but old React's numbers are 100% hardcoded literals that can
  never change, while vanilla's are genuinely computed from its local `DB` object. Pick
  whichever layout richness you want when rebuilding; neither is more "correct."
- **Admin-panel also has a second, unused-and-dead `pages/` + `components/Layout/` +
  `store/useStore.js` tree** inside `_old-react-v3` — never imported by `App.jsx`
  (which only imports from `screens/`). It uses a real Zustand store and a *cleaner*
  component structure than `screens/`, worth a look when rebuilding, but it's dead
  code today, not the "real" old app.
- **Vendor-portal's vanilla version has extra nav surface** (bottom-nav "Offers" tab
  with a "Counter offers" quick-action, a "Pay" tab) not present in old React's 7-page
  set (`AddProduct`, `Dashboard`, `DeadStockAlerts`, `Earnings`, `Login`, `MyProducts`,
  `Profile`). These are still mock/fake screens in the vanilla version, not real-API,
  so nothing functional is lost — just note the nav gap for whoever rebuilds it.
- **Neither old React nor the vanilla rewrite uses the target light/purple/cream
  palette.** Both are dark-themed: old React's `tailwind.config.js` (both apps) has
  `brand:'#7C6FF7'` on `bg:'#0C0D10'`; the vanilla CSS uses `--accent:#7c5cbf` on
  `--bg:#0e0f11`/`#0A0A0F`. The actual `#5A1FB3`/`#5D35AE` source of truth is
  `shared/ui/tokens.js` from PR #5 — recoloring is a separate, later task, not part of
  this restoration.

## The part worth preserving: real API wiring pattern

### Shared helper pattern (both apps, same shape, different key prefix)

```js
const API_BASE = 'https://api.banjaramarketgurgaon.com';
const getToken = () => localStorage.getItem('<prefix>_token');
const setSession = (access, refresh, name) => {
  localStorage.setItem('<prefix>_token', access);
  localStorage.setItem('<prefix>_refresh', refresh);
  localStorage.setItem('<prefix>_name', name);
};
const clearSession = () => { /* remove the three keys above */ };

async function apiFetch(path, opts) {
  opts = opts || {};
  const headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, Object.assign({}, opts, { headers }));
  let body = {};
  try { body = await res.json(); } catch (e) {}
  if (!res.ok) throw new Error(body.message || body.error || `Request failed (${res.status})`);
  return body.data;
}
```

- admin-panel's key prefix: `bbos_admin` (`bbos_admin_token`, `bbos_admin_refresh`, `bbos_admin_name`)
- vendor-portal's key prefix: `bbv` (`bbv_token`, `bbv_refresh`, `bbv_name`)

### admin-panel — real endpoints wired

| Screen | Endpoint | Notes |
|---|---|---|
| Login | `POST /api/v1/auth/login` | `{email, password}` → `{data:{access_token, refresh_token, user:{name}}}` |
| Approval Queue | `GET /api/v1/products/admin/pending?limit=100` | list |
| Approval Queue | `POST /api/v1/products/{id}/approve` | body `{}` |
| Approval Queue | `POST /api/v1/products/{id}/reject` | body `{reason}` |
| Vendor Directory | `GET /api/v1/vendors/applications` | despite the name, lists vendors of every status |
| Vendor Directory | `POST /api/v1/vendors/{id}/approve` | body `{}` |
| Vendor Directory | `POST /api/v1/vendors/{id}/reject` | body `{reason}` |
| Vendor Directory | `POST /api/v1/vendors/{id}/suspend` | body `{reason}` |

Everything else in admin-panel's nav (Active Products, Negotiations, Dead Stock,
Sales, Finance, Staff, CRM, Analytics, System, etc.) is still fake/local data in the
vanilla version too — only the two rows above are real.

### vendor-portal — real endpoints wired

| Screen | Endpoint | Notes |
|---|---|---|
| Login | `POST /api/v1/auth/login` | same contract as admin |
| Onboarding/register | `POST /api/v1/vendors/register` | real backend requires admin approval before the `vendor` role is granted; a freshly-approved vendor must log in again to get a token carrying the new role |

Deep-link support: vendor-portal's boot logic checks `?onboard=1` in the URL and
routes straight to the onboarding screen instead of login, for "Become a Vendor"
marketing links.

## Known real-backend gotchas (from prior session work, still true)

1. Nginx has `location /api/v1/products/` (trailing slash) which does **not** match
   a bare `POST /api/v1/products` — any new bare-collection route needs its own exact
   match block server-side.
2. A vendor only gets the `vendor` role (and can create/submit products) after an
   admin approves them — their existing JWT won't carry the new role until they log
   in again post-approval.
3. CORS: confirmed working from `localhost:5174` (admin-panel) and documented as
   allowed from `localhost:5176`/`8901` (vendor-portal) — both verified reachable
   with no CORS block during headless-browser testing on 2026-07-18.
