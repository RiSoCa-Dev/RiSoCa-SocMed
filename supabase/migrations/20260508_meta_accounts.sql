create extension if not exists pgcrypto;

alter table public.social_accounts
add column if not exists platform_account_id text,
add column if not exists username text,
add column if not exists metadata jsonb default '{}'::jsonb;

create unique index if not exists social_accounts_platform_account_unique
on public.social_accounts(platform, platform_account_id)
where platform_account_id is not null;

create table if not exists public.meta_pages (
  id uuid primary key default gen_random_uuid(),
  page_id text not null unique,
  page_name text,
  page_access_token text not null,
  instagram_business_account_id text,
  instagram_username text,
  connected_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.meta_pages enable row level security;

drop policy if exists "Allow public read meta_pages" on public.meta_pages;
drop policy if exists "Allow public insert meta_pages" on public.meta_pages;
drop policy if exists "Allow public update meta_pages" on public.meta_pages;
drop policy if exists "Allow public delete meta_pages" on public.meta_pages;

create policy "Allow public read meta_pages" on public.meta_pages for select using (true);
create policy "Allow public insert meta_pages" on public.meta_pages for insert with check (true);
create policy "Allow public update meta_pages" on public.meta_pages for update using (true) with check (true);
create policy "Allow public delete meta_pages" on public.meta_pages for delete using (true);
