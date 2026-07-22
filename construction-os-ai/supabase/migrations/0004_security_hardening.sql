-- ConstructionOS AI — security hardening
--
-- Addresses findings from Supabase's security advisor after the first live
-- deployment:
-- 1. set_updated_at() was missing `set search_path`, unlike the project's
--    other SECURITY DEFINER-adjacent functions — a mutable search_path on a
--    trigger function is a hijacking vector.
-- 2. The "Anyone can insert an organization for themselves" policy allowed
--    any authenticated client to insert arbitrary organizations via the
--    client SDK. It was never actually needed: organizations are only ever
--    created by handle_new_user(), a SECURITY DEFINER trigger owned by the
--    migration role, which bypasses RLS regardless of this policy.
-- 3. is_org_member() doesn't need to be callable by anonymous (unauthenticated)
--    clients — every policy that uses it evaluates auth.uid(), which is null
--    for anon anyway, so revoking anon's EXECUTE closes off direct RPC
--    probing without affecting any authenticated flow.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy "Anyone can insert an organization for themselves" on public.organizations;

-- Functions are executable by PUBLIC by default in Postgres — revoking from
-- just `anon` isn't enough, since `anon` inherits PUBLIC's grant.
revoke execute on function public.is_org_member(uuid) from public;
grant execute on function public.is_org_member(uuid) to authenticated, service_role;
