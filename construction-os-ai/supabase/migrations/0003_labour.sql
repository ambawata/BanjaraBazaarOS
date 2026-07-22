-- ConstructionOS AI — Labour ledger (Module 11)
--
-- Workers on a project, their daily attendance, and payments/advances made
-- to them. Dues are computed client-side from attendance × daily_rate minus
-- payments — deterministic, so nothing here duplicates that total.

create type public.labour_shift as enum ('half_day', 'full_day', 'overtime');

create table public.labourers (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  name text not null,
  trade text,
  phone text,
  daily_rate numeric(10, 2) not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint labourers_daily_rate_valid check (daily_rate >= 0)
);

create index labourers_project_id_idx on public.labourers (project_id);

create table public.labour_attendance (
  id uuid primary key default gen_random_uuid(),
  labourer_id uuid not null references public.labourers (id) on delete cascade,
  work_date date not null,
  shift public.labour_shift not null default 'full_day',
  overtime_hours numeric(4, 1) not null default 0,
  note text,
  created_at timestamptz not null default now(),
  unique (labourer_id, work_date),
  constraint labour_attendance_overtime_valid check (overtime_hours >= 0)
);

create index labour_attendance_labourer_id_idx on public.labour_attendance (labourer_id);

create table public.labour_payments (
  id uuid primary key default gen_random_uuid(),
  labourer_id uuid not null references public.labourers (id) on delete cascade,
  amount numeric(10, 2) not null,
  paid_on date not null default current_date,
  note text,
  created_at timestamptz not null default now(),
  constraint labour_payments_amount_positive check (amount > 0)
);

create index labour_payments_labourer_id_idx on public.labour_payments (labourer_id);

create trigger labourers_set_updated_at
  before update on public.labourers
  for each row execute function public.set_updated_at();

alter table public.labourers enable row level security;
alter table public.labour_attendance enable row level security;
alter table public.labour_payments enable row level security;

create policy "Members can view labourers on their projects" on public.labourers
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = labourers.project_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can manage labourers on their projects" on public.labourers
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = labourers.project_id
        and public.is_org_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = labourers.project_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can view attendance on their projects" on public.labour_attendance
  for select using (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_attendance.labourer_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can manage attendance on their projects" on public.labour_attendance
  for all using (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_attendance.labourer_id
        and public.is_org_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_attendance.labourer_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can view payments on their projects" on public.labour_payments
  for select using (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_payments.labourer_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can manage payments on their projects" on public.labour_payments
  for all using (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_payments.labourer_id
        and public.is_org_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.labourers l
      join public.projects p on p.id = l.project_id
      where l.id = labour_payments.labourer_id
        and public.is_org_member(p.organization_id)
    )
  );
