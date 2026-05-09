create extension if not exists pgcrypto;

alter table public.meta_pages enable row level security;

drop policy if exists "Allow public read meta_pages" on public.meta_pages;
drop policy if exists "Allow public insert meta_pages" on public.meta_pages;
drop policy if exists "Allow public update meta_pages" on public.meta_pages;
drop policy if exists "Allow public delete meta_pages" on public.meta_pages;

comment on table public.meta_pages is 'Stores Meta page and Instagram access tokens. Access through Edge Functions only.';

alter table public.scheduled_posts enable row level security;

alter table public.scheduled_posts
add column if not exists selected_platforms text[] not null default array['youtube']::text[],
add column if not exists platform_payload jsonb not null default '{}'::jsonb,
add column if not exists retry_count integer not null default 0,
add column if not exists last_attempt_at timestamptz;

drop policy if exists "Allow public read scheduled_posts" on public.scheduled_posts;
drop policy if exists "Allow public insert scheduled_posts" on public.scheduled_posts;
drop policy if exists "Allow public update scheduled_posts" on public.scheduled_posts;
drop policy if exists "Allow public delete scheduled_posts" on public.scheduled_posts;

create table if not exists public.publish_logs (
  id uuid primary key default gen_random_uuid(),
  scheduled_post_id uuid references public.scheduled_posts(id) on delete cascade,
  platform text not null,
  status text not null,
  message text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.publish_logs enable row level security;

drop policy if exists "Allow public read publish_logs" on public.publish_logs;
drop policy if exists "Allow public insert publish_logs" on public.publish_logs;
drop policy if exists "Allow public update publish_logs" on public.publish_logs;
drop policy if exists "Allow public delete publish_logs" on public.publish_logs;

create index if not exists publish_logs_scheduled_post_idx
on public.publish_logs (scheduled_post_id, created_at desc);

create table if not exists public.oauth_states (
  id uuid primary key default gen_random_uuid(),
  state text not null unique,
  provider text not null,
  platform text,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.oauth_states enable row level security;

drop policy if exists "Allow public read oauth_states" on public.oauth_states;
drop policy if exists "Allow public insert oauth_states" on public.oauth_states;
drop policy if exists "Allow public update oauth_states" on public.oauth_states;
drop policy if exists "Allow public delete oauth_states" on public.oauth_states;

create index if not exists oauth_states_state_idx
on public.oauth_states (state);

create index if not exists oauth_states_expires_at_idx
on public.oauth_states (expires_at);
