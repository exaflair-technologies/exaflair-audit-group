-- Roles shared by both apps: "user" for the frontend, "admin" for the admin panel.
create type public.app_role as enum ('user', 'admin');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- security definer so policies can check the role without recursing into profiles RLS.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Users read own profile, admins read all"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Admins update any profile"
  on public.profiles for update
  using (public.is_admin());

-- Only admins may change a role. A policy can't compare against the old row without
-- querying profiles from inside its own policy (infinite recursion), so a trigger does it.
-- Sessions with no signed-in user (SQL editor, service role) are allowed, so the first
-- admin can be set from Supabase Studio.
create or replace function public.prevent_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'only admins can change roles' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_prevent_role_change
  before update on public.profiles
  for each row execute function public.prevent_role_change();

-- Shared by every table with an updated_at column.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row whenever someone signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
