create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  username text,
  balance numeric(12,2) not null default 0,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount > 0),
  category text not null,
  created_at timestamptz not null default now()
);

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
