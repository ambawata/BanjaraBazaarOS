-- ConstructionOS AI — Area / Structural / Cost engine (Modules 5, 6, 9)
--
-- Scope: the assumption knobs behind a project's estimate (floor height,
-- opening counts, labour/machine/transport/contingency/GST/margin %) plus
-- an organization's material rate overrides. Quantities and costs are
-- computed client-side (src/features/estimate/engine.ts) from these inputs
-- plus the project's own fields (built_up_area_sqft, floors, ...) — they
-- are deterministic, so only the *inputs* need to be persisted, not every
-- derived line item.

create table public.project_estimates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null unique references public.projects (id) on delete cascade,

  floor_height_ft numeric(6, 2) not null default 10,
  door_count smallint not null default 0,
  window_count smallint not null default 0,

  labour_cost_pct numeric(5, 2) not null default 35,
  machine_cost_pct numeric(5, 2) not null default 5,
  transport_cost_pct numeric(5, 2) not null default 4,
  contingency_pct numeric(5, 2) not null default 5,
  gst_pct numeric(5, 2) not null default 18,
  contractor_margin_pct numeric(5, 2) not null default 10,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint project_estimates_floor_height_positive check (floor_height_ft > 0),
  constraint project_estimates_counts_valid check (door_count >= 0 and window_count >= 0),
  constraint project_estimates_pct_valid check (
    labour_cost_pct >= 0 and machine_cost_pct >= 0 and transport_cost_pct >= 0 and
    contingency_pct >= 0 and gst_pct >= 0 and contractor_margin_pct >= 0
  )
);

create trigger project_estimates_set_updated_at
  before update on public.project_estimates
  for each row execute function public.set_updated_at();

alter table public.project_estimates enable row level security;

create policy "Members can view estimates for their projects" on public.project_estimates
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_estimates.project_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can manage estimates for their projects" on public.project_estimates
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_estimates.project_id
        and public.is_org_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_estimates.project_id
        and public.is_org_member(p.organization_id)
    )
  );

-- Material rate overrides. Unset materials fall back to the built-in
-- defaults in src/features/estimate/engine.ts — this table only holds an
-- organization's edits away from those defaults.
create type public.material_key as enum (
  'cement',
  'steel',
  'sand',
  'aggregate',
  'bricks',
  'plaster',
  'paint',
  'tiles',
  'door',
  'window'
);

create table public.material_rates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  material_key public.material_key not null,
  rate numeric(12, 2) not null,
  updated_at timestamptz not null default now(),
  unique (organization_id, material_key),
  constraint material_rates_rate_positive check (rate >= 0)
);

create trigger material_rates_set_updated_at
  before update on public.material_rates
  for each row execute function public.set_updated_at();

alter table public.material_rates enable row level security;

create policy "Members can view their organization's material rates" on public.material_rates
  for select using (public.is_org_member(organization_id));

create policy "Members can manage their organization's material rates" on public.material_rates
  for all using (public.is_org_member(organization_id))
  with check (public.is_org_member(organization_id));
