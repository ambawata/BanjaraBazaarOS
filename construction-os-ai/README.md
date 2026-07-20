# ConstructionOS AI

Plan better. Build smarter. Spend less.

An AI-first construction operating system for homeowners, contractors,
architects and engineers — planning, estimation, execution and site
management in one place.

This app is **independent of BanjaraBazaarOS**. It does not import backend
internals from `/backend` (PHP) or share its database — by design, so it can
later be consumed by BanjaraBazaarOS, RentProOS, VastuGriha AI or third
parties as its own product with its own clean API surface.

## Status

- Auth (Supabase Auth — email/password), personal workspace on sign-up
- **Module 1 — Projects**: create, rename, duplicate, archive/restore, delete
- **Module 2 — Project details**: construction type, plot size, built-up
  area, floors, basement, location, Google Maps link, and owner/architect/
  engineer/contractor contacts
- **Modules 5, 6, 9 — Area / Structural / Cost engine** (`src/features/estimate`):
  built-up/carpet/wall/paint/plaster/tile/ceiling/roof/door/window area,
  RCC + masonry material quantities (cement, steel, sand, aggregate, bricks,
  binding wire, water), and a full cost estimate (material → labour/
  machinery/transport → contingency → GST → contractor margin → grand total
  and cost/sq ft). Every number is a deterministic, pure function
  (`engine.ts`) of the project's fields plus editable assumptions and
  material rates — every line shows the formula that produced it.
- **Module 17 — Dashboard shell**: project overview stats, including a live
  estimated cost once built-up area is set
- **Module 18 — Reports**: "Download PDF" on the Estimate tab generates a
  branded, print-ready cost estimate (area/structural/cost tables + grand
  total). PDF generation (`jspdf`) is code-split so it's only downloaded
  when the button is actually clicked.

Everything else in the long-term vision (AI floor plan analysis, MEP/
finishing engines, BOQ export, labour & material management, site diary, AI
Civil Engineer / Interior Designer, Vastu Studio, marketplace) is
represented in the sidebar as "on the roadmap" and will be built out in
later modules on top of this foundation.

## Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4 (CSS-first theme, see `src/index.css`)
- Hand-rolled shadcn-style primitives on Radix UI (`src/components/ui`)
- TanStack Query for server state, React Hook Form + Zod for forms
- Framer Motion for motion/micro-interactions
- Supabase (Postgres + Auth), schema in `supabase/migrations`

## Getting started

1. Create a Supabase project.
2. Apply the migrations in `supabase/migrations/` in order (SQL editor, or
   `supabase db push` if you use the Supabase CLI locally).
3. Copy `.env.example` to `.env` and fill in your project URL + anon key.
4. `npm install`
5. `npm run dev`

## Project structure

```
src/
  app/            App shell wiring: router, providers, theme, page title
  components/ui/  Design-system primitives (Button, Card, Dialog, ...)
  components/layout/  Sidebar, Topbar, AppShell
  features/
    auth/         Login/signup, auth context
    organizations/ Current user's workspace
    projects/      Module 1 (project management) + Module 2 (project details)
    estimate/      Modules 5/6/9 — area/structural/cost engine + editable rates
    dashboard/     Home page
  types/database.ts  Hand-written mirror of the Supabase schema
supabase/migrations/ Postgres schema, RLS policies, triggers
```

Regenerate `src/types/database.ts` from a live project with:

```
supabase gen types typescript --project-id <id> > src/types/database.ts
```
