-- =============================================================
-- GC — Galeria de Camisetas: Supabase Schema
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================================

-- PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  main_club text,
  why_collect text,
  onboarding_done boolean not null default false,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- SHIRTS TABLE
create table if not exists public.shirts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  clube text not null,
  temporada text not null,
  versao text not null check (versao in ('home','away','third','goalkeeper','special')),
  liga text,
  fabricante text,
  condicao text check (condicao in ('nova','boa','usada','desfeitos')),
  historia text,
  original_url text,
  processed_url text,
  processing_status text not null default 'none' check (processing_status in ('none','pending','done','failed')),
  created_at timestamptz not null default now()
);

-- =============================================================
-- RLS POLICIES
-- =============================================================

alter table public.profiles enable row level security;
alter table public.shirts enable row level security;

-- Profiles: users see/edit only their own
create policy "profiles: own read" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles: own insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles: own update" on public.profiles
  for update using (auth.uid() = id);

-- Shirts: users see/edit only their own
create policy "shirts: own read" on public.shirts
  for select using (auth.uid() = user_id);

create policy "shirts: own insert" on public.shirts
  for insert with check (auth.uid() = user_id);

create policy "shirts: own update" on public.shirts
  for update using (auth.uid() = user_id);

create policy "shirts: own delete" on public.shirts
  for delete using (auth.uid() = user_id);

-- =============================================================
-- STORAGE BUCKETS
-- Create these in Storage Dashboard (or via API):
--
--   bucket: shirt-originals  (public)
--   bucket: shirt-processed  (public)
--
-- Storage policies (add in dashboard after creating buckets):
--
--   shirt-originals SELECT: bucket_id = 'shirt-originals'
--   shirt-originals INSERT: auth.uid()::text = (storage.foldername(name))[1]
--   shirt-processed SELECT: bucket_id = 'shirt-processed'
--   shirt-processed INSERT: auth.role() = 'service_role'
-- =============================================================

-- =============================================================
-- MIGRATION: Run this if the table already exists
-- =============================================================

-- Add liga column
alter table public.shirts add column if not exists liga text;

-- Update condicao constraint (nova, boa, usada, desfeitos)
alter table public.shirts drop constraint if exists shirts_condicao_check;
alter table public.shirts add constraint shirts_condicao_check
  check (condicao in ('nova','boa','usada','desfeitos'));
