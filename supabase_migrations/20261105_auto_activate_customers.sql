-- Allow a new customer to access the portal immediately after sign-up.
alter table public.profiles alter column status set default 'active';

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

-- Customers created before this migration can access the portal too.
update public.profiles
set status = 'active'
where role = 'customer' and status = 'pending';
