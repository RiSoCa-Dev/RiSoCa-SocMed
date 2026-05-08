create table if not exists public.social_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null unique,
  access_token text,
  refresh_token text,
  token_type text,
  scope text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.social_accounts is 'Stores OAuth tokens for connected social platforms. Access through Edge Functions only.';

alter table public.social_accounts enable row level security;

-- No anon/auth policies are created on purpose.
-- Edge Functions use SUPABASE_SERVICE_ROLE_KEY to read/write tokens.
