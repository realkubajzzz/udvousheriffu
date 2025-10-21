-- Run these statements in your Supabase SQL editor

-- 1) Storage: create bucket named 'gallery' (via Supabase UI or SQL)
-- 2) Tables
create table if not exists public.gallery (
  id bigserial primary key,
  filename text not null,
  url text not null,
  caption text,
  uploader text,
  created_at timestamptz default now()
);

create table if not exists public.site_status (
  id integer primary key,
  is_open boolean not null default true,
  updated_by text,
  updated_at timestamptz default now()
);

-- Insert initial row for site_status
insert into public.site_status(id, is_open) values (1, true) on conflict (id) do nothing;

-- RLS guidance: allow public (anon) role to SELECT but not INSERT/UPDATE.
-- Use service_role key on the bot to INSERT/UPDATE.

-- Example: enable RLS on gallery and allow SELECT for anon
alter table public.gallery enable row level security;
create policy "anon_select" on public.gallery for select using (true);
-- deny insert/update/delete to anon by default

alter table public.site_status enable row level security;
create policy "anon_select_status" on public.site_status for select using (true);

-- If you want to allow client uploads directly to storage without bot, set storage policies carefully.
