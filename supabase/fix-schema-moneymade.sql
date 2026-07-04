-- MoneyMade schema repair
-- Goal: make `profiles` and `expenses` match what the app expects.
-- Run this in Supabase SQL Editor.

create extension if not exists "pgcrypto";

-- 1) Ensure profiles table + required columns exist
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  username text,
  balance numeric(12,2) not null default 0,
  full_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists balance numeric(12,2) not null default 0;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists created_at timestamptz not null default now();

-- 2) Ensure expenses table + required columns exist
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text,
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  created_at timestamptz not null default now()
);

alter table public.expenses add column if not exists user_id uuid not null;
alter table public.expenses add column if not exists title text;
alter table public.expenses add column if not exists created_at timestamptz not null default now();
alter table public.expenses add column if not exists category text not null;

-- 3) Fix foreign key to reference profiles(id)
do $$
declare
  fk record;
begin
  -- Drop any existing FK from expenses -> profiles (whatever it currently points at)
  for fk in
    select conname
    from pg_constraint
    where contype = 'f'
      and conrelid = 'public.expenses'::regclass
      and confrelid = 'public.profiles'::regclass
  loop
    execute format('alter table public.expenses drop constraint %I', fk.conname);
  end loop;

  -- Add the FK back with the expected target
  begin
    alter table public.expenses
      add constraint expenses_user_id_fkey
      foreign key (user_id) references public.profiles(id)
      on delete cascade;
  exception when duplicate_object then
    null;
  end;
end $$;

-- 4) RLS policies (match app auth.uid() usage)
alter table public.profiles enable row level security;
alter table public.expenses enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "expenses_select_own" on public.expenses;
create policy "expenses_select_own"
on public.expenses
for select
using (auth.uid() = user_id);

drop policy if exists "expenses_insert_own" on public.expenses;
create policy "expenses_insert_own"
on public.expenses
for insert
with check (auth.uid() = user_id);

drop policy if exists "expenses_update_own" on public.expenses;
create policy "expenses_update_own"
on public.expenses
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "expenses_delete_own" on public.expenses;
create policy "expenses_delete_own"
on public.expenses
for delete
using (auth.uid() = user_id);

