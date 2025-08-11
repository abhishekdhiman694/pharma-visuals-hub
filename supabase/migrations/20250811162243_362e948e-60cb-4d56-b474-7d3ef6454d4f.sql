-- Fix linter issues: user_roles RLS policies and function search_path

-- 1) Update function with explicit search_path
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) RLS policies for user_roles (avoid recursion via has_role)
alter table public.user_roles enable row level security;

-- Clear old policies if any
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "No inserts to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No updates to user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "No deletes to user_roles" ON public.user_roles;

-- Allow users to read only their own roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- Block direct writes from clients; manage via service role/console only
CREATE POLICY "No inserts to user_roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (false);

CREATE POLICY "No updates to user_roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (false) WITH CHECK (false);

CREATE POLICY "No deletes to user_roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (false);
