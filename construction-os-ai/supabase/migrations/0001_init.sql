-- ConstructionOS AI — core schema (Module 1: Project Management, Module 2: Project Details)
-- Independent Supabase/Postgres project. Not coupled to the BanjaraBazaarOS MySQL backend.
--
-- Scope of this migration: organizations/teams, profiles, project CRUD + details,
-- project contacts (owner/architect/engineer/contractor), and a generic audit log
-- that later modules (cost engine, BOQ, labour, etc.) can also write to.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.org_role as enum ('owner', 'admin', 'member');

create type public.project_status as enum (
  'planning',
  'in_progress',
  'on_hold',
  'completed',
  'archived'
);

create type public.construction_category as enum (
  'residential',
  'villa',
  'apartment',
  'commercial',
  'factory',
  'school',
  'hospital',
  'other'
);

create type public.project_contact_role as enum (
  'owner',
  'architect',
  'engineer',
  'contractor',
  'other'
);

create type public.audit_action as enum ('created', 'updated', 'archived', 'restored', 'deleted');

-- ---------------------------------------------------------------------------
-- Core tables
-- ---------------------------------------------------------------------------

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by uuid references public.profiles (id) on delete set null,
  name text not null,
  description text,
  status public.project_status not null default 'planning',
  construction_category public.construction_category not null default 'residential',

  plot_size_sqft numeric(12, 2),
  built_up_area_sqft numeric(12, 2),
  floors_above_ground smallint not null default 1,
  has_basement boolean not null default false,
  basement_count smallint not null default 0,

  location_address text,
  location_lat double precision,
  location_lng double precision,
  google_maps_url text,

  cover_image_url text,

  is_archived boolean not null default false,
  archived_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint projects_plot_size_positive check (plot_size_sqft is null or plot_size_sqft >= 0),
  constraint projects_built_up_area_positive check (built_up_area_sqft is null or built_up_area_sqft >= 0),
  constraint projects_floors_positive check (floors_above_ground >= 0),
  constraint projects_basement_count_valid check (basement_count >= 0)
);

create index projects_organization_id_idx on public.projects (organization_id);
create index projects_status_idx on public.projects (status) where not is_archived;

create table public.project_contacts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  role public.project_contact_role not null,
  name text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (project_id, role)
);

create index project_contacts_project_id_idx on public.project_contacts (project_id);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  actor_id uuid references public.profiles (id) on delete set null,
  entity_type text not null,
  entity_id uuid not null,
  action public.audit_action not null,
  diff jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id);
create index audit_logs_organization_id_idx on public.audit_logs (organization_id);

-- ---------------------------------------------------------------------------
-- Helper functions
-- ---------------------------------------------------------------------------

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = target_org_id
      and m.profile_id = auth.uid()
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_set_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

create trigger project_contacts_set_updated_at
  before update on public.project_contacts
  for each row execute function public.set_updated_at();

-- Generic audit trigger, reusable by future module tables (cost engine, BOQ, etc.)
create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_org_id uuid;
  action public.audit_action;
begin
  if tg_op = 'INSERT' then
    target_org_id := new.organization_id;
    action := 'created';
  elsif tg_op = 'DELETE' then
    target_org_id := old.organization_id;
    action := 'deleted';
  else
    target_org_id := new.organization_id;
    action := case
      when new.is_archived and not old.is_archived then 'archived'::public.audit_action
      when old.is_archived and not new.is_archived then 'restored'::public.audit_action
      else 'updated'::public.audit_action
    end;
  end if;

  insert into public.audit_logs (organization_id, actor_id, entity_type, entity_id, action, diff)
  values (
    target_org_id,
    auth.uid(),
    tg_table_name,
    coalesce(new.id, old.id),
    action,
    jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new))
  );

  return coalesce(new, old);
end;
$$;

create trigger projects_audit
  after insert or update or delete on public.projects
  for each row execute function public.log_audit_event();

-- New auth user -> profile + personal organization + membership
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_org_id uuid;
  display_name text;
begin
  display_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1));

  insert into public.profiles (id, full_name, email)
  values (new.id, display_name, new.email);

  insert into public.organizations (name, slug)
  values (
    display_name || '''s Workspace',
    'org-' || replace(new.id::text, '-', '')
  )
  returning id into new_org_id;

  insert into public.organization_members (organization_id, profile_id, role)
  values (new_org_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_contacts enable row level security;
alter table public.audit_logs enable row level security;

create policy "Members can view their organization" on public.organizations
  for select using (public.is_org_member(id));

create policy "Owners and admins can update their organization" on public.organizations
  for update using (
    exists (
      select 1 from public.organization_members m
      where m.organization_id = organizations.id
        and m.profile_id = auth.uid()
        and m.role in ('owner', 'admin')
    )
  );

create policy "Anyone can insert an organization for themselves" on public.organizations
  for insert with check (true);

create policy "Users can view their own profile" on public.profiles
  for select using (id = auth.uid());

create policy "Users can view profiles of org teammates" on public.profiles
  for select using (
    exists (
      select 1
      from public.organization_members mine
      join public.organization_members theirs on theirs.organization_id = mine.organization_id
      where mine.profile_id = auth.uid()
        and theirs.profile_id = profiles.id
    )
  );

create policy "Users can update their own profile" on public.profiles
  for update using (id = auth.uid());

create policy "Members can view their organization's membership list" on public.organization_members
  for select using (public.is_org_member(organization_id));

create policy "Members can view projects in their organization" on public.projects
  for select using (public.is_org_member(organization_id));

create policy "Members can create projects in their organization" on public.projects
  for insert with check (public.is_org_member(organization_id));

create policy "Members can update projects in their organization" on public.projects
  for update using (public.is_org_member(organization_id));

create policy "Members can delete projects in their organization" on public.projects
  for delete using (public.is_org_member(organization_id));

create policy "Members can view contacts for their projects" on public.project_contacts
  for select using (
    exists (
      select 1 from public.projects p
      where p.id = project_contacts.project_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can manage contacts for their projects" on public.project_contacts
  for all using (
    exists (
      select 1 from public.projects p
      where p.id = project_contacts.project_id
        and public.is_org_member(p.organization_id)
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_contacts.project_id
        and public.is_org_member(p.organization_id)
    )
  );

create policy "Members can view their organization's audit log" on public.audit_logs
  for select using (public.is_org_member(organization_id));
