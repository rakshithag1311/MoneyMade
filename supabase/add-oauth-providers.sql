-- Create table to store OAuth provider information
create table if not exists public.oauth_providers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null, -- 'google', 'github', etc.
  provider_user_id text not null, -- ID from the OAuth provider
  email text,
  avatar_url text,
  full_name text,
  raw_user_meta_data jsonb, -- Store complete metadata from provider
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_user_id)
);

-- Enable RLS
alter table public.oauth_providers enable row level security;

-- RLS Policies for oauth_providers
drop policy if exists "oauth_providers_select_own" on public.oauth_providers;
create policy "oauth_providers_select_own"
on public.oauth_providers
for select
using (auth.uid() = user_id);

drop policy if exists "oauth_providers_insert_own" on public.oauth_providers;
create policy "oauth_providers_insert_own"
on public.oauth_providers
for insert
with check (auth.uid() = user_id);

drop policy if exists "oauth_providers_update_own" on public.oauth_providers;
create policy "oauth_providers_update_own"
on public.oauth_providers
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists idx_oauth_providers_user_id on public.oauth_providers(user_id);
create index if not exists idx_oauth_providers_provider on public.oauth_providers(provider);

-- Function to automatically update updated_at timestamp
create or replace function public.update_oauth_providers_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update updated_at
drop trigger if exists update_oauth_providers_updated_at on public.oauth_providers;
create trigger update_oauth_providers_updated_at
  before update on public.oauth_providers
  for each row
  execute function public.update_oauth_providers_updated_at();
