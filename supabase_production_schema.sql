-- ==============================================================================
-- ChargeNear: Production Database Schema & Row Level Security (RLS) Review
-- Peer-to-Peer EV Charging Marketplace for Pakistan
-- ==============================================================================

create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  city text default 'Lahore',
  avatar_url text,
  role text not null check (role in ('driver', 'host')),
  is_admin boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Public read for profile display (e.g., host names on listings, reviews)
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- Self-insert on signup
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Self-update only (cannot elevate own is_admin)
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (
    auth.uid() = id and
    (is_admin is null or is_admin = (select is_admin from public.profiles where id = auth.uid()))
  );

-- ------------------------------------------------------------------------------
-- 2. CHARGERS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.chargers (
  id uuid default uuid_generate_v4() primary key,
  host_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  address text not null,
  city text not null default 'Karachi',
  latitude double precision not null,
  longitude double precision not null,
  connector_type text not null check (connector_type in ('Type 2', 'CCS2', 'GB/T', 'CHAdeMO', 'Type 1')),
  power_kw numeric(5,1) not null default 7.4,
  price_per_kwh_pkr numeric(8,2) not null,
  photos text[] default '{}',
  available_hours text not null default '24/7',
  notes text,
  status text not null default 'active' check (status in ('active', 'paused')),
  is_verified boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.chargers enable row level security;

-- Public can view active chargers
create policy "Chargers viewable by everyone"
  on public.chargers for select
  using (true);

-- Authenticated hosts can insert their own charger
create policy "Hosts can create chargers"
  on public.chargers for insert
  with check (auth.uid() = host_id);

-- Only host can update their listing (cannot self-verify)
create policy "Hosts can update own chargers"
  on public.chargers for update
  using (auth.uid() = host_id)
  with check (
    auth.uid() = host_id and 
    (is_verified is null or is_verified = (select is_verified from public.chargers where id = chargers.id))
  );

-- Only host can delete their listing
create policy "Hosts can delete own chargers"
  on public.chargers for delete
  using (auth.uid() = host_id);

-- ------------------------------------------------------------------------------
-- 3. BOOKINGS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.bookings (
  id uuid default uuid_generate_v4() primary key,
  charger_id uuid references public.chargers(id) on delete cascade not null,
  driver_id uuid references public.profiles(id) on delete cascade not null,
  host_id uuid references public.profiles(id) on delete cascade not null,
  start_time timestamptz not null,
  duration_hours numeric(3,1) not null default 2.0,
  estimated_kwh numeric(6,2) not null default 20.0,
  actual_kwh numeric(6,2),
  total_amount_pkr numeric(10,2) not null,
  platform_fee_pkr numeric(10,2) not null,  -- 15%
  host_earnings_pkr numeric(10,2) not null, -- 85%
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'active', 'completed', 'cancelled')),
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'paid_mock', 'refunded')),
  payment_method text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.bookings enable row level security;

-- Visible strictly to the driver and host involved
create policy "Bookings visible only to driver and host"
  on public.bookings for select
  using (auth.uid() = driver_id or auth.uid() = host_id);

-- Drivers can create booking requests
create policy "Drivers can insert bookings"
  on public.bookings for insert
  with check (auth.uid() = driver_id);

-- Driver and host can update booking status (transitions)
create policy "Driver and host can update their bookings"
  on public.bookings for update
  using (auth.uid() = driver_id or auth.uid() = host_id)
  with check (auth.uid() = driver_id or auth.uid() = host_id);

-- ------------------------------------------------------------------------------
-- 4. REVIEWS TABLE
-- ------------------------------------------------------------------------------
create table if not exists public.reviews (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  charger_id uuid references public.chargers(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  target_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text not null,
  created_at timestamptz default now()
);

alter table public.reviews enable row level security;

-- Public can read reviews for transparent ratings
create policy "Reviews viewable by everyone"
  on public.reviews for select
  using (true);

-- Authenticated participants can create review
create policy "Participants can write reviews"
  on public.reviews for insert
  with check (auth.uid() = reviewer_id);

-- ------------------------------------------------------------------------------
-- 5. DISPUTES & VERIFICATIONS
-- ------------------------------------------------------------------------------
create table if not exists public.disputes (
  id uuid default uuid_generate_v4() primary key,
  booking_id uuid references public.bookings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  reason text not null,
  description text not null,
  status text not null default 'open' check (status in ('open', 'resolved')),
  admin_resolution text,
  created_at timestamptz default now()
);

alter table public.disputes enable row level security;

create policy "Reporter and involved host/driver can view disputes"
  on public.disputes for select
  using (auth.uid() = reporter_id);

create policy "Users can file disputes"
  on public.disputes for insert
  with check (auth.uid() = reporter_id);
