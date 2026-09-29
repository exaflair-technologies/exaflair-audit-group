-- Audit portfolio (with PDF reports) and brand partner logos.
-- Admins (profiles.role = 'admin') manage everything; the public sees only published / active rows.

create type public.audit_tier as enum ('silver', 'gold', 'platinum');

-- ---------------------------------------------------------------------------
-- Audits
-- ---------------------------------------------------------------------------

create table public.audits (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  client_name text not null check (length(trim(client_name)) > 0),
  project_name text not null check (length(trim(project_name)) > 0),
  summary text,
  tier public.audit_tier not null,
  chain text,                -- e.g. Ethereum, Base, Solana
  language text,             -- e.g. Solidity, Rust, Move
  audited_at date not null,
  repo_url text check (repo_url is null or repo_url ~* '^https?://'),

  -- Object path inside the "audit-reports" bucket, e.g. 'acme-vault/report-v1.pdf'.
  report_path text check (report_path is null or report_path ~* '\.pdf$'),
  -- Object path inside the "partner-logos" bucket.
  client_logo_path text,

  critical_count integer not null default 0 check (critical_count >= 0),
  high_count integer not null default 0 check (high_count >= 0),
  medium_count integer not null default 0 check (medium_count >= 0),
  low_count integer not null default 0 check (low_count >= 0),
  info_count integer not null default 0 check (info_count >= 0),
  total_findings integer generated always as
    (critical_count + high_count + medium_count + low_count + info_count) stored,

  is_published boolean not null default false,
  published_at timestamptz,
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index audits_published_idx on public.audits (audited_at desc) where is_published;

alter table public.audits enable row level security;

create policy "Anyone reads published audits, admins read all"
  on public.audits for select
  using (is_published or public.is_admin());

create policy "Admins insert audits"
  on public.audits for insert
  with check (public.is_admin());

create policy "Admins update audits"
  on public.audits for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete audits"
  on public.audits for delete
  using (public.is_admin());

-- Stamp published_at the first time an audit goes live.
create or replace function public.stamp_audit_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.is_published and new.published_at is null then
    new.published_at = now();
  end if;
  return new;
end;
$$;

create trigger audits_stamp_published_at
  before insert or update on public.audits
  for each row execute function public.stamp_audit_published_at();

create trigger audits_set_updated_at
  before update on public.audits
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Brand partners
-- ---------------------------------------------------------------------------

create table public.partners (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(trim(name)) > 0),
  -- Object path inside the "partner-logos" bucket, e.g. 'acme.svg'.
  logo_path text not null,
  website_url text check (website_url is null or website_url ~* '^https?://'),
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index partners_active_order_idx on public.partners (sort_order, name) where is_active;

alter table public.partners enable row level security;

create policy "Anyone reads active partners, admins read all"
  on public.partners for select
  using (is_active or public.is_admin());

create policy "Admins insert partners"
  on public.partners for insert
  with check (public.is_admin());

create policy "Admins update partners"
  on public.partners for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins delete partners"
  on public.partners for delete
  using (public.is_admin());

create trigger partners_set_updated_at
  before update on public.partners
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------------

-- Reports are private: the site hands out short-lived signed URLs, and only for
-- published audits, so an unpublished report can't be fetched by guessing its path.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('audit-reports', 'audit-reports', false, 52428800, array['application/pdf'])
on conflict (id) do nothing;

-- Logos are public: they're shown on the site to everyone anyway.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'partner-logos',
  'partner-logos',
  true,
  2097152,
  array['image/svg+xml', 'image/png', 'image/webp', 'image/jpeg']
)
on conflict (id) do nothing;

create policy "Public reads reports of published audits"
  on storage.objects for select
  using (
    bucket_id = 'audit-reports'
    and exists (
      select 1 from public.audits a
      where a.report_path = storage.objects.name and a.is_published
    )
  );

create policy "Admins read all reports"
  on storage.objects for select
  using (bucket_id = 'audit-reports' and public.is_admin());

create policy "Admins upload reports and logos"
  on storage.objects for insert
  with check (bucket_id in ('audit-reports', 'partner-logos') and public.is_admin());

create policy "Admins update reports and logos"
  on storage.objects for update
  using (bucket_id in ('audit-reports', 'partner-logos') and public.is_admin())
  with check (bucket_id in ('audit-reports', 'partner-logos') and public.is_admin());

create policy "Admins delete reports and logos"
  on storage.objects for delete
  using (bucket_id in ('audit-reports', 'partner-logos') and public.is_admin());
