create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', false)
on conflict (id) do nothing;

create table if not exists public.scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  platform text not null default 'youtube',
  title text,
  description text,
  video_path text not null,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled',
  privacy_status text not null default 'private',
  youtube_video_id text,
  upload_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  uploaded_at timestamptz
);

alter table public.scheduled_posts
add column if not exists platform text default 'youtube',
add column if not exists title text,
add column if not exists description text,
add column if not exists video_path text,
add column if not exists scheduled_at timestamptz,
add column if not exists status text default 'scheduled',
add column if not exists privacy_status text default 'private',
add column if not exists youtube_video_id text,
add column if not exists upload_error text,
add column if not exists created_at timestamptz default now(),
add column if not exists updated_at timestamptz default now(),
add column if not exists uploaded_at timestamptz;

create index if not exists scheduled_posts_due_idx
on public.scheduled_posts (status, scheduled_at);
