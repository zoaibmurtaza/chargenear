-- ChargeNear Database Schema: Phase 1
-- Tables: profiles, chargers
-- RLS enabled and configured for role-based safety

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  city text default 'Lahore',
  role text not null check (role in ('driver', 'host')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Profiles RLS
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Chargers Table
create table if not exists public.chargers (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  address text not null,
  latitude double precision not null,
  longitude double precision not null,
  connector_type text not null check (connector_type in ('Type 2', 'CCS2', 'GB/T', 'CHAdeMO', 'Type 1')),
  power_kw numeric(5,1) not null default 7.4,
  price_per_kwh_pkr numeric(8,2) not null,
  photos text[] default '{}',
  available_hours text not null default '24/7',
  notes text,
  status text not null default 'active' check (status in ('active', 'paused')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Chargers RLS
alter table public.chargers enable row level security;

-- Listings are publicly readable
create policy "Chargers are viewable by everyone"
  on public.chargers for select
  using (true);

-- Hosts can insert their own charger
create policy "Hosts can create chargers"
  on public.chargers for insert
  with check (auth.uid() = host_id);

-- Hosts can update their own chargers
create policy "Hosts can update own chargers"
  on public.chargers for update
  using (auth.uid() = host_id);

-- Hosts can delete their own chargers
create policy "Hosts can delete own chargers"
  on public.chargers for delete
  using (auth.uid() = host_id);

-- Storage bucket for charger photos
insert into storage.buckets (id, name, public)
values ('charger-photos', 'charger-photos', true)
on conflict (id) do nothing;

create policy "Charger photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'charger-photos');

create policy "Authenticated users can upload charger photos"
  on storage.objects for insert
  with check (bucket_id = 'charger-photos' and auth.role() = 'authenticated');

create policy "Users can update and delete their own charger photos"
  on storage.objects for delete
  using (bucket_id = 'charger-photos' and auth.uid() = owner);
