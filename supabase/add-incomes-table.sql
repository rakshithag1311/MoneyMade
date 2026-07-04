-- Create incomes table for MoneyMade app
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  amount numeric(12,2) not null check (amount > 0),
  date timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.incomes enable row level security;

-- RLS Policies for incomes
drop policy if exists "incomes_select_own" on public.incomes;
create policy "incomes_select_own"
on public.incomes
for select
using (auth.uid() = user_id);

drop policy if exists "incomes_insert_own" on public.incomes;
create policy "incomes_insert_own"
on public.incomes
for insert
with check (auth.uid() = user_id);

drop policy if exists "incomes_update_own" on public.incomes;
create policy "incomes_update_own"
on public.incomes
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "incomes_delete_own" on public.incomes;
create policy "incomes_delete_own"
on public.incomes
for delete
using (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_incomes_user_id on public.incomes(user_id);
create index if not exists idx_incomes_date on public.incomes(date);
