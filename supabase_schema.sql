-- ============================================================
-- HARYHORDHEYLEY Smart Tech Digital Service — Admin Dashboard
-- Supabase schema: tables, relationships, RLS policies
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

-- ---------- EXTENSIONS ----------
create extension if not exists "uuid-ossp";

-- ============================================================
-- ADMIN PROFILES
-- One row per authenticated admin/staff user (linked to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'admin' check (role in ('admin', 'staff', 'super_admin')),
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email), 'admin');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  phone text,
  email text,
  address text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SERVICES
-- ============================================================
create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  price numeric(12, 2) not null default 0,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  amount numeric(12, 2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid')),
  order_status text not null default 'pending' check (order_status in ('pending', 'processing', 'completed', 'cancelled')),
  order_date date not null default current_date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  amount numeric(12, 2) not null default 0,
  method text not null default 'cash' check (method in ('cash', 'bank_transfer', 'card', 'pos', 'other')),
  status text not null default 'pending' check (status in ('pending', 'success', 'failed', 'refunded')),
  paid_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid references public.profiles (id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- BUSINESS SETTINGS (single-row table)
-- ============================================================
create table if not exists public.business_settings (
  id int primary key default 1,
  business_name text not null default 'HARYHORDHEYLEY Smart Tech Digital Service',
  logo_url text,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into public.business_settings (id, business_name)
values (1, 'HARYHORDHEYLEY Smart Tech Digital Service')
on conflict (id) do nothing;

-- ============================================================
-- updated_at auto-touch trigger (reused across tables)
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_profiles on public.profiles;
create trigger touch_profiles before update on public.profiles
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_customers on public.customers;
create trigger touch_customers before update on public.customers
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_services on public.services;
create trigger touch_services before update on public.services
  for each row execute procedure public.touch_updated_at();

drop trigger if exists touch_orders on public.orders;
create trigger touch_orders before update on public.orders
  for each row execute procedure public.touch_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- Model: any authenticated admin/staff user (i.e. anyone who can log
-- into this dashboard) can read/write all business data. Only a
-- user's own profile row is directly self-editable.
-- ============================================================
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.business_settings enable row level security;

-- PROFILES
create policy "Authenticated users can view all profiles"
  on public.profiles for select
  to authenticated using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- CUSTOMERS
create policy "Authenticated users can manage customers"
  on public.customers for all
  to authenticated using (true) with check (true);

-- SERVICES
create policy "Authenticated users can manage services"
  on public.services for all
  to authenticated using (true) with check (true);

-- ORDERS
create policy "Authenticated users can manage orders"
  on public.orders for all
  to authenticated using (true) with check (true);

-- PAYMENTS
create policy "Authenticated users can manage payments"
  on public.payments for all
  to authenticated using (true) with check (true);

-- NOTIFICATIONS (each user only sees their own)
create policy "Users can view their own notifications"
  on public.notifications for select
  to authenticated using (auth.uid() = recipient_id);

create policy "Users can update their own notifications"
  on public.notifications for update
  to authenticated using (auth.uid() = recipient_id);

create policy "Authenticated users can insert notifications"
  on public.notifications for insert
  to authenticated with check (true);

-- BUSINESS SETTINGS
create policy "Authenticated users can view business settings"
  on public.business_settings for select
  to authenticated using (true);

create policy "Authenticated users can update business settings"
  on public.business_settings for update
  to authenticated using (true) with check (true);

-- ============================================================
-- STORAGE (run once — creates buckets for avatars & logos)
-- ============================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do nothing;

create policy "Authenticated users can upload avatars"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'avatars');

create policy "Anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Authenticated users can upload business assets"
  on storage.objects for insert
  to authenticated with check (bucket_id = 'business-assets');

create policy "Anyone can view business assets"
  on storage.objects for select
  using (bucket_id = 'business-assets');
