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

Phase 1 (this slice): project management core.

- Auth (Supabase Auth — email/password), personal workspace on sign-up
- Projects: create, rename, duplicate, archive/restore, delete
- Project details: construction type, plot size, built-up area, floors,
  basement, location, Google Maps link, and owner/architect/engineer/
  contractor contacts
- Project overview dashboard shell (stats now; cost/BOQ/AI panels land next)

Everything else in the long-term vision (AI floor plan analysis, structural/
MEP/finishing engines, cost engine, labour & material management, site
diary, AI Civil Engineer / Interior Designer, Vastu Studio, marketplace) is
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
2. Apply `supabase/migrations/0001_init.sql` (SQL editor, or `supabase db push`
   if you use the Supabase CLI locally).
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
    dashboard/     Home page
  types/database.ts  Hand-written mirror of the Supabase schema
supabase/migrations/ Postgres schema, RLS policies, triggers
```

Regenerate `src/types/database.ts` from a live project with:

```
supabase gen types typescript --project-id <id> > src/types/database.ts
```
