-- HARYHORDHEYLEY Smart Tech Digital Services
-- Fresh-install schema. Existing Supabase projects should run the migration in
-- supabase_migrations/20261102_security_and_customer_portal.sql instead.

create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  address text,
  bio text,
  avatar_url text,
  role text not null default 'customer'
    check (role in ('customer', 'admin', 'staff', 'super_admin')),
  status text not null default 'active'
    check (status in ('pending', 'active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  name text not null,
  phone text,
  email text,
  address text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.services (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  category text,
  price numeric(12, 2) not null default 0 check (price >= 0),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid references public.customers (id) on delete set null,
  placed_by uuid references public.profiles (id) on delete set null,
  service_id uuid references public.services (id) on delete set null,
  notes text,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  payment_status text not null default 'unpaid'
    check (payment_status in ('unpaid', 'partial', 'paid')),
  order_status text not null default 'pending'
    check (order_status in ('pending', 'processing', 'completed', 'cancelled')),
  order_date date not null default current_date,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders (id) on delete cascade,
  customer_id uuid references public.customers (id) on delete set null,
  placed_by uuid references public.profiles (id) on delete set null,
  amount numeric(12, 2) not null default 0 check (amount > 0),
  method text not null default 'cash'
    check (method in ('cash', 'bank_transfer', 'card', 'pos', 'other')),
  status text not null default 'pending'
    check (status in ('pending', 'success', 'failed', 'refunded')),
  proof_path text,
  paid_at timestamptz not null default now(),
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (length(trim(body)) > 0),
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.business_settings (
  id int primary key default 1 check (id = 1),
  business_name text not null default 'HARYHORDHEYLEY Smart Tech Digital Services',
  phone text,
  email text,
  address text,
  logo_url text,
  theme text not null default 'light' check (theme in ('light', 'dark')),
  updated_at timestamptz not null default now()
);

insert into public.business_settings (id, business_name)
values (1, 'HARYHORDHEYLEY Smart Tech Digital Services')
on conflict (id) do nothing;

create or replace function public.is_active_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff', 'super_admin')
      and status = 'active'
  );
$$;

create or replace function public.is_active_customer()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'customer' and status = 'active'
  );
$$;

revoke all on function public.is_active_admin() from public, anon;
revoke all on function public.is_active_customer() from public, anon;
grant execute on function public.is_active_admin() to authenticated;
grant execute on function public.is_active_customer() to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, status)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'customer',
    'active'
  );
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  active_admin_count integer;
begin
  if current_user in ('postgres', 'supabase_admin', 'service_role') then
    return new;
  end if;

  if (new.role is distinct from old.role or new.status is distinct from old.status)
     and not public.is_active_admin() then
    raise exception 'Only an active administrator can change account roles or status.'
      using errcode = '42501';
  end if;

  if old.role in ('admin', 'staff', 'super_admin') and old.status = 'active'
     and (new.role not in ('admin', 'staff', 'super_admin') or new.status <> 'active') then
    select count(*) into active_admin_count
      from public.profiles
      where role in ('admin', 'staff', 'super_admin') and status = 'active';
    if active_admin_count <= 1 then
      raise exception 'The last active administrator cannot be suspended or demoted.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileges on public.profiles;
create trigger protect_profile_privileges
  before update on public.profiles
  for each row execute procedure public.protect_profile_privileges();

create or replace function public.create_customer_record_for_profile()
returns trigger
language plpgsql security definer
set search_path = public, auth
as $$
begin
  if new.role = 'customer' then
    insert into public.customers (profile_id, name, phone, email)
    select new.id, coalesce(new.full_name, 'Customer'), new.phone, users.email
      from auth.users as users where users.id = new.id
    on conflict (profile_id) do nothing;

    insert into public.notifications (recipient_id, title, message)
    select profiles.id, 'New customer signup',
      coalesce(new.full_name, 'A new customer') || ' created an account.'
      from public.profiles as profiles
      where profiles.role in ('admin', 'staff', 'super_admin')
        and profiles.status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists create_customer_record_for_profile on public.profiles;
create trigger create_customer_record_for_profile
  after insert on public.profiles
  for each row execute procedure public.create_customer_record_for_profile();

create or replace function public.prepare_customer_order()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  service_price numeric(12, 2);
  customer_record_id uuid;
begin
  if public.is_active_admin() then
    return new;
  end if;
  if not public.is_active_customer() then
    raise exception 'An active customer account is required to place an order.'
      using errcode = '42501';
  end if;

  select price into service_price from public.services
    where id = new.service_id and status = 'active';
  if not found then
    raise exception 'The selected service is unavailable.' using errcode = '23503';
  end if;

  select id into customer_record_id from public.customers where profile_id = auth.uid();
  if customer_record_id is null then
    raise exception 'Your customer profile is not ready. Contact support.';
  end if;

  new.placed_by := auth.uid();
  new.customer_id := customer_record_id;
  new.created_by := null;
  new.amount := service_price;
  new.order_status := 'pending';
  new.payment_status := 'unpaid';
  new.order_date := current_date;
  return new;
end;
$$;

drop trigger if exists prepare_customer_order on public.orders;
create trigger prepare_customer_order
  before insert on public.orders
  for each row execute procedure public.prepare_customer_order();

create or replace function public.prepare_customer_payment()
returns trigger
language plpgsql security definer
set search_path = public
as $$
declare
  order_total numeric(12, 2);
  paid_total numeric(12, 2);
  crm_customer_id uuid;
begin
  if public.is_active_admin() then
    return new;
  end if;
  if not public.is_active_customer() then
    raise exception 'An active customer account is required to submit payment proof.'
      using errcode = '42501';
  end if;

  select amount, customer_id into order_total, crm_customer_id
    from public.orders
    where id = new.order_id and placed_by = auth.uid() and order_status <> 'cancelled';
  if not found then
    raise exception 'The selected order does not belong to your account.' using errcode = '42501';
  end if;

  select coalesce(sum(amount), 0) into paid_total
    from public.payments where order_id = new.order_id and status = 'success';
  if new.amount <= 0 or new.amount > order_total - paid_total then
    raise exception 'Payment amount must be positive and no greater than the amount remaining.';
  end if;
  if new.proof_path is null or split_part(new.proof_path, '/', 1) <> auth.uid()::text then
    raise exception 'A payment proof belonging to this account is required.';
  end if;

  new.placed_by := auth.uid();
  new.customer_id := crm_customer_id;
  new.created_by := null;
  new.status := 'pending';
  new.paid_at := now();
  return new;
end;
$$;

drop trigger if exists prepare_customer_payment on public.payments;
create trigger prepare_customer_payment
  before insert on public.payments
  for each row execute procedure public.prepare_customer_payment();

create or replace function public.recalculate_order_payment_status(order_id_input uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  order_total numeric(12, 2);
  paid_total numeric(12, 2);
begin
  select amount into order_total from public.orders where id = order_id_input;
  if not found then return; end if;

  select coalesce(sum(amount), 0) into paid_total
    from public.payments where order_id = order_id_input and status = 'success';

  update public.orders set payment_status = case
    when paid_total >= order_total then 'paid'
    when paid_total > 0 then 'partial'
    else 'unpaid'
  end where id = order_id_input;
end;
$$;

create or replace function public.sync_order_payment_status()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recalculate_order_payment_status(old.order_id);
    return old;
  end if;
  perform public.recalculate_order_payment_status(new.order_id);
  if tg_op = 'UPDATE' and old.order_id is distinct from new.order_id then
    perform public.recalculate_order_payment_status(old.order_id);
  end if;
  return new;
end;
$$;

drop trigger if exists sync_order_payment_status on public.payments;
create trigger sync_order_payment_status
  after insert or update of order_id, amount, status or delete on public.payments
  for each row execute procedure public.sync_order_payment_status();

create or replace function public.notify_for_new_message()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if public.is_active_admin() then
    insert into public.notifications (recipient_id, title, message)
    values (new.customer_id, 'New reply', left(new.body, 500));
  else
    insert into public.notifications (recipient_id, title, message)
    select profiles.id, 'New customer message', left(new.body, 500)
      from public.profiles as profiles
      where profiles.role in ('admin', 'staff', 'super_admin')
        and profiles.status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists notify_for_new_message on public.messages;
create trigger notify_for_new_message
  after insert on public.messages
  for each row execute procedure public.notify_for_new_message();

create or replace function public.notify_for_customer_order()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.placed_by is not null then
    insert into public.notifications (recipient_id, title, message)
    select profiles.id, 'New order placed', 'A customer submitted a new order.'
      from public.profiles as profiles
      where profiles.role in ('admin', 'staff', 'super_admin')
        and profiles.status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists notify_for_customer_order on public.orders;
create trigger notify_for_customer_order
  after insert on public.orders
  for each row execute procedure public.notify_for_customer_order();

create or replace function public.notify_for_customer_payment()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' and new.placed_by is not null then
    insert into public.notifications (recipient_id, title, message)
    select profiles.id, 'Payment proof uploaded', 'A customer submitted payment proof for review.'
      from public.profiles as profiles
      where profiles.role in ('admin', 'staff', 'super_admin')
        and profiles.status = 'active';
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status
        and new.placed_by is not null then
    insert into public.notifications (recipient_id, title, message)
    values (
      new.placed_by,
      case when new.status = 'success' then 'Payment confirmed' else 'Payment status updated' end,
      'Your payment status is now ' || new.status || '.'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists notify_for_customer_payment on public.payments;
create trigger notify_for_customer_payment
  after insert or update of status on public.payments
  for each row execute procedure public.notify_for_customer_payment();

create or replace function public.cancel_customer_order(p_order_id uuid)
returns void
language plpgsql security definer
set search_path = public
as $$
begin
  if not public.is_active_customer() then
    raise exception 'An active customer account is required.' using errcode = '42501';
  end if;

  update public.orders set order_status = 'cancelled'
    where id = p_order_id
      and placed_by = auth.uid()
      and order_status = 'pending';

  if not found then
    raise exception 'Only your own pending orders can be cancelled.';
  end if;
end;
$$;

revoke all on function public.cancel_customer_order(uuid) from public, anon;
grant execute on function public.cancel_customer_order(uuid) to authenticated;

create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
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

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.services enable row level security;
alter table public.orders enable row level security;
alter table public.payments enable row level security;
alter table public.notifications enable row level security;
alter table public.messages enable row level security;
alter table public.business_settings enable row level security;

drop policy if exists "Authenticated users can view all profiles" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Active users can view their profile" on public.profiles;
drop policy if exists "Active admins can view all profiles" on public.profiles;
drop policy if exists "Users can update own profile fields" on public.profiles;
drop policy if exists "Active admins can manage profiles" on public.profiles;
create policy "Active users can view their profile" on public.profiles
  for select to authenticated using (auth.uid() = id);
create policy "Active admins can view all profiles" on public.profiles
  for select to authenticated using (public.is_active_admin());
create policy "Users can update own profile fields" on public.profiles
  for update to authenticated using (auth.uid() = id)
  with check (auth.uid() = id);
create policy "Active admins can manage profiles" on public.profiles
  for all to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());

drop policy if exists "Authenticated users can manage customers" on public.customers;
drop policy if exists "Active admins manage customers" on public.customers;
create policy "Active admins manage customers" on public.customers
  for all to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());

drop policy if exists "Authenticated users can manage services" on public.services;
drop policy if exists "Active admins manage services" on public.services;
drop policy if exists "Customers view active services" on public.services;
create policy "Active admins manage services" on public.services
  for all to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());
create policy "Customers view active services" on public.services
  for select to authenticated using (public.is_active_customer() and status = 'active');

drop policy if exists "Authenticated users can manage orders" on public.orders;
drop policy if exists "Active admins manage orders" on public.orders;
drop policy if exists "Customers view their orders" on public.orders;
drop policy if exists "Customers place their orders" on public.orders;
create policy "Active admins manage orders" on public.orders
  for all to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());
create policy "Customers view their orders" on public.orders
  for select to authenticated using (public.is_active_customer() and placed_by = auth.uid());
create policy "Customers place their orders" on public.orders
  for insert to authenticated with check (public.is_active_customer() and placed_by = auth.uid());

drop policy if exists "Authenticated users can manage payments" on public.payments;
drop policy if exists "Active admins manage payments" on public.payments;
drop policy if exists "Customers view their payments" on public.payments;
drop policy if exists "Customers submit payment proof" on public.payments;
create policy "Active admins manage payments" on public.payments
  for all to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());
create policy "Customers view their payments" on public.payments
  for select to authenticated using (public.is_active_customer() and placed_by = auth.uid());
create policy "Customers submit payment proof" on public.payments
  for insert to authenticated with check (public.is_active_customer() and placed_by = auth.uid());

drop policy if exists "Users can view their own notifications" on public.notifications;
drop policy if exists "Users can update their own notifications" on public.notifications;
drop policy if exists "Authenticated users can insert notifications" on public.notifications;
drop policy if exists "Users view own notifications" on public.notifications;
drop policy if exists "Users update own notifications" on public.notifications;
drop policy if exists "Active admins insert notifications" on public.notifications;
create policy "Users view own notifications" on public.notifications
  for select to authenticated using (auth.uid() = recipient_id);
create policy "Users update own notifications" on public.notifications
  for update to authenticated using (auth.uid() = recipient_id)
  with check (auth.uid() = recipient_id);
create policy "Active admins insert notifications" on public.notifications
  for insert to authenticated with check (public.is_active_admin());

drop policy if exists "Customers and admins view conversations" on public.messages;
drop policy if exists "Customers and admins send messages" on public.messages;
drop policy if exists "Customers and admins mark messages read" on public.messages;
create policy "Customers and admins view conversations" on public.messages
  for select to authenticated using (
    public.is_active_admin() or (public.is_active_customer() and customer_id = auth.uid())
  );
create policy "Customers and admins send messages" on public.messages
  for insert to authenticated with check (
    sender_id = auth.uid() and (
      (public.is_active_admin()) or
      (public.is_active_customer() and customer_id = auth.uid())
    )
  );
create policy "Customers and admins mark messages read" on public.messages
  for update to authenticated using (
    public.is_active_admin() or (public.is_active_customer() and customer_id = auth.uid())
  ) with check (
    public.is_active_admin() or (public.is_active_customer() and customer_id = auth.uid())
  );

drop policy if exists "Authenticated users can view business settings" on public.business_settings;
drop policy if exists "Authenticated users can update business settings" on public.business_settings;
drop policy if exists "Active users view business settings" on public.business_settings;
drop policy if exists "Active admins update business settings" on public.business_settings;
create policy "Active users view business settings" on public.business_settings
  for select to authenticated using (public.is_active_admin() or public.is_active_customer());
create policy "Active admins update business settings" on public.business_settings
  for update to authenticated using (public.is_active_admin())
  with check (public.is_active_admin());

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.customers, public.services,
  public.orders, public.payments, public.notifications, public.messages,
  public.business_settings to authenticated;
revoke insert, delete on public.profiles from authenticated;
revoke update on public.messages from authenticated;
grant update (is_read) on public.messages to authenticated;
revoke update on public.notifications from authenticated;
grant update (is_read) on public.notifications to authenticated;

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', true)
on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('payment-proofs', 'payment-proofs', false, 5242880, array['image/jpeg', 'image/png'])
on conflict (id) do update set public = false, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png'];

drop policy if exists "Authenticated users can upload avatars" on storage.objects;
drop policy if exists "Anyone can view avatars" on storage.objects;
drop policy if exists "Authenticated users can upload business assets" on storage.objects;
drop policy if exists "Anyone can view business assets" on storage.objects;
drop policy if exists "Customers upload own avatars" on storage.objects;
drop policy if exists "Active users view avatars" on storage.objects;
drop policy if exists "Admins manage business assets" on storage.objects;
drop policy if exists "Customers upload own payment proofs" on storage.objects;
drop policy if exists "Customers delete own payment proofs" on storage.objects;
drop policy if exists "Admins view payment proofs" on storage.objects;
create policy "Customers upload own avatars" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Active users view avatars" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Admins manage business assets" on storage.objects
  for all to authenticated using (
    bucket_id = 'business-assets' and public.is_active_admin()
  ) with check (
    bucket_id = 'business-assets' and public.is_active_admin()
  );
create policy "Customers upload own payment proofs" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'payment-proofs'
    and public.is_active_customer()
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Customers delete own payment proofs" on storage.objects
  for delete to authenticated using (
    bucket_id = 'payment-proofs'
    and public.is_active_customer()
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Admins view payment proofs" on storage.objects
  for select to authenticated using (
    bucket_id = 'payment-proofs' and public.is_active_admin()
  );

-- Bootstrap one trusted administrator from the Supabase SQL Editor after
-- creating its Auth user:
-- update public.profiles set role = 'admin', status = 'active'
-- where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
